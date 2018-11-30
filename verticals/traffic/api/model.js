'use strict';

var _ = require('underscore');
var MetadataInstanceModel = require('../../models/metadatainstancemodel');
var PGSQLModel = require('../../models/pgsqlmodel');
var utils = require('../../utils.js');
var log = utils.log();
var QueryBuilder = require('../../protools/querybuilder');
var HistFormatter = require('../../protools/histformatter');


class TrafficModel extends PGSQLModel {
  constructor(cfg) {
    super(cfg);
  }

  get this() {
    return this; // Because parent is not a strict class
  }


  getAvailables(opts) {
    let vars = [
      'traffic.bikehiredockingstation.availablebikenumber',
      'traffic.bikehiredockingstation.freeslotnumber'
    ];

    var metadata = new MetadataInstanceModel();
    return metadata.getVarQueryArray(opts.scope, vars)
    .then( data => {
      return this.promiseRow(data);
    })
    .then((function(d) {
      var vars = _.object(d.vars_ids, d.vars);
      var schema = d.dbschema;
      var tableName = d.now;

      var qb = new QueryBuilder(opts);
      var filter = qb.bbox() + ' ' + qb.filter();

      var sql = `SELECT
        SUM(availablebikenumber) as availablebikenumber,
        SUM(freeslotnumber) as rentedbikenumber
      FROM ${schema}.${tableName}
      WHERE true
      ${filter}`;

      return this.cachedQuery(sql)
      .then(data => {
        return Promise.resolve(new HistFormatter().keysToCategoires(data.rows[0]));
      })
      .catch(err => {
        return Promise.reject(err);
      })

    }).bind(this));

  }

  getOccupancyScatterDailyAgg(opts) {

    var dbschema = opts.scope;
    var qb = new QueryBuilder(opts);
    var filter = qb.bbox() + ' ' + qb.filter();

    var sql = `
      WITH timeserie as (
        SELECT generate_series(
          date_trunc('minute', '${opts.time.start}'::timestamp),
          date_trunc('minute', '${opts.time.finish}'::timestamp),
          '1h'::interval) as hour),
      fullserie AS (
        SELECT DISTINCT
          a.id_entity,
          a."TimeInstant",
          (CASE WHEN a.totalslotnumber=0 THEN 0
            ELSE coalesce(a.freeslotnumber/a.totalslotnumber, 0) * 100
          END) AS occupancy
          FROM "${dbschema}".traffic_bikehiredockingstation_measurand a
          JOIN "${dbschema}".traffic_bikehiredockingstation_lastdata p ON
          a.id_entity=p.id_entity
          WHERE true
          ${filter}
          AND a."TimeInstant" >= date_trunc('minute', '${opts.time.start}'::timestamp)
          AND a."TimeInstant" < date_trunc('minute', '${opts.time.finish}'::timestamp)
      ),
      data AS (
      SELECT
        extract(EPOCH FROM (timeserie.hour))::int % 86400 as x,
        MIN(occupancy) as min,
        AVG(occupancy) as avg,
        MAX(occupancy) as max
        FROM timeserie
        JOIN fullserie
        ON fullserie."TimeInstant">=timeserie.hour
        AND fullserie."TimeInstant" < (timeserie.hour + '1h'::interval)
        GROUP BY x ORDER BY x)
      SELECT json_build_object(
        'min', json_build_object('x', x, 'y', min, 'hour', (x/3600)::int),
        'avg', json_build_object('x', x, 'y', avg, 'hour', (x/3600)::int),
        'max', json_build_object('x', x, 'y', max, 'hour', (x/3600)::int)
        ) AS row FROM data`;


    return this.cachedQuery(sql)
    .then(function(result) {

      var formatted = {};
      formatted.avg = [];
      formatted.max = [];
      formatted.min = [];

      _.each(result.rows, function(every) {
        var obj = every.row;
        formatted.min.push(obj.min);
        formatted.avg.push(obj.avg);
        formatted.max.push(obj.max);

      });

      return Promise.resolve(formatted);

    });


  }



  getOccTimeserie(opts) {
    var dbschema = opts.scope;
    var qb = new QueryBuilder(opts);
    var filter = qb.bbox() + ' ' + qb.filter();

    var sql = `
      WITH timeserie as (
        SELECT generate_series(
          date_trunc('minute', '${opts.time.start}'::timestamp),
          date_trunc('minute', '${opts.time.finish}'::timestamp),
          '${opts.time.step}'::interval) as step),
      fullserie AS (
        SELECT DISTINCT
          d.id_entity,
          d."TimeInstant",
          d.availablebikenumber as available,
          d.totalslotnumber as total,
          d.freeslotnumber as occupied
          FROM "${dbschema}".traffic_bikehiredockingstation_measurand d JOIN
          "${dbschema}".traffic_bikehiredockingstation_lastdata p ON
          d.id_entity = p.id_entity
          WHERE true
          ${filter}
          AND d."TimeInstant" >= date_trunc('minute', '${opts.time.start}'::timestamp)
          AND d."TimeInstant" < date_trunc('minute', '${opts.time.finish}'::timestamp)
          AND d.totalslotnumber!=0
          ORDER BY id_entity, "TimeInstant"
      ),
      _data AS (
      SELECT DISTINCT
        fullserie.id_entity,
        timeserie.step as time,
        AVG(fullserie.available) as available,
        AVG(fullserie.total) as total,
        AVG(fullserie.occupied) as occupied
        FROM timeserie
        LEFT JOIN fullserie
        ON fullserie."TimeInstant">=timeserie.step AND fullserie."TimeInstant" < (timeserie.step + '${opts.time.step}'::interval)
        GROUP BY fullserie.id_entity, timeserie.step ORDER BY timeserie.step),
      data AS (
        SELECT
          time,
          SUM(available) AS available,
          SUM(total) AS total,
          SUM(occupied) AS occupied
        FROM _data
        GROUP BY time
      )
      SELECT json_build_object(
        'time', time::timestamp at time zone 'UTC',
        'data', json_build_object(
          'occupancy', (100 * occupied/total)::int ,
          'available', available,
          'occupied', occupied
          )
        ) AS row FROM data ORDER BY time`;


    return this.cachedQuery(sql)
    .then(function(result) {

      var formatted = [];
      _.each(result.rows, function(every) {
        var obj = every.row;
        formatted.push({
          'time': obj.time,
          'data': {
            'occupancy': obj.data.occupancy,
            'available': obj.data.available,
            'occupied': obj.data.occupied
          }
        });
      });

      return Promise.resolve(formatted);
    });
  }


  getAvailableDailyScatter(opts) {

    var qb = new QueryBuilder(opts);
    var filter = qb.bbox() + ' ' + qb.filter();

    var sql = `
      SELECT
        id_entity as id,
        AVG(availability) as y,
        hour*3600 as x,
        weekend
      FROM
      (
        SELECT
          m.id_entity,
          (m.availablebikenumber/m.totalslotnumber) * 100 as availability,
          EXTRACT(hour from m."TimeInstant") as hour,
          EXTRACT(dow from m."TimeInstant") as day,
          (CASE WHEN EXTRACT(dow from m."TimeInstant")=0 THEN true
          WHEN EXTRACT(dow from m."TimeInstant")=6 THEN true
          ELSE false END) as weekend,
          m."TimeInstant"
        FROM ${opts.scope}.traffic_bikehiredockingstation_measurand m
        JOIN ${opts.scope}.traffic_bikehiredockingstation_lastdata ld ON m.id_entity=ld.id_entity
        WHERE true
        ${filter}
        AND m.totalslotnumber!=0
        ORDER BY "TimeInstant"
      ) AS t
      WHERE weekend=${opts.weekend}
      GROUP BY id_entity, hour, weekend
      ORDER BY hour, weekend, id_entity`;

    return this.promise_query(sql)
    .then( data => {
      return Promise.resolve(data.rows);
    })
    .catch( err => {
      log.error(err);
      return Promise.reject(err);
    });
  }

}

module.exports = TrafficModel;
