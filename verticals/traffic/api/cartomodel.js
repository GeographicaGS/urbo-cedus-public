'use strict';

var CartoModel = require('../../models/cartomodel.js');
var QueryBuilder = require('../../protools/querybuilder.js');


class TrafficCartoModel extends CartoModel {

  constructor(cfg) {
    super(cfg);
  }

  getRanking(opts) {

    var qb = new QueryBuilder(opts);
    var filter = qb.CARTObbox() + ' ' + qb.filter();

    var sql = `
      SELECT
        ld.name,
        ld.id_entity,
        obs.people
      FROM ${opts.scope}_traffic_bikehiredockingstation_lastdata ld
      LEFT JOIN ${opts.scope}_traffic_bikehiredockingstation_obs obs ON ld.id_entity = obs.id_entity
      WHERE true
      ${filter}
      ORDER BY people DESC, name ASC LIMIT 5`;


    return this.query({
      'query': sql
    }).then( d => {
      if (d.rows) {
        return Promise.resolve(d.rows);
      }
      else {
        return Promise.resolve([]);
      }

    });

  }

}

module.exports = TrafficCartoModel;
