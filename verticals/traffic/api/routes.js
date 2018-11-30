'use strict';

var auth = require('../../auth.js');
var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var utils = require('../../utils.js');
var responseValidator = utils.responseValidator;
var log = utils.log();
var TrafficModel = require('./model.js');
var TrafficCartoModel = require('./cartomodel.js');
var BaseFormatter = require('../../protools/baseformatter');
var ScatterFormatter = require('../../protools/scatterformatter');
var CSVFormatter = require('../../protools/csvformatter');


router.post('/available/histogram/discrete/now', function(req, res, next) {

  var opts = {
    scope: req.scope,
    filters: req.body.filters || {}
  }

  var model = new TrafficModel(config.getData().pgsql);
  model.getAvailables(opts)
  .then(data => {
    res.json(data);
  })
  .catch( err => {
    log.error(err);
    next(err);
  })
});



router.post('/people/ranking/now',
  function(req, res, next) {

    var opts = {
      scope: req.scope,
      filters: req.body.filters || {}
    }

    config.getCARTO(req.scope, 'traffic')
  .then( cartoconfig => {

    var model = new TrafficCartoModel(cartoconfig);
    model.getRanking(opts)
    .then(data => {
      res.json(data);
    })
    .catch( err => {
      log.error(err);
      next(err);
    });


  });
  });



var occTSDailyValidator = function(req, res, next) {
  var time = req.body.time || {};
  req.checkBody('time.start', 'time.finish required').notEmpty().requiredField(time.finish);
  req.checkBody('time.finish', 'time.start required').notEmpty().requiredField(time.start);
  req.checkBody('filters.bbox', 'array required for filters.bbox').optional().isArray();
  return next();
}


router.post('/available_percentage/scatter/daily/agg',
  occTSDailyValidator,
  responseValidator,
  auth.validateVariables(
    [
      'traffic.bikehiredockingstation.freeslotnumber',
      'traffic.bikehiredockingstation.totalslotnumber'
    ]),
  function(req, res, next) {
    var opts = {
      scope: req.scope,
      time: req.body.time || {},
      filters: req.body.filters || {}
    }
    new TrafficModel().getOccupancyScatterDailyAgg(opts)
    .then(new BaseFormatter().pipe)
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      log.error(err);
      res.status(400).json(err);
    });
  });



var occTimeserieValidator = function(req, res, next) {
  var time = req.body.time || {};
  req.checkBody('time.start', 'time.finish required').notEmpty().requiredField(time.finish);
  req.checkBody('time.finish', 'time.start required').notEmpty().requiredField(time.start);
  req.checkBody('time.step', 'time.step required').notEmpty();
  req.checkBody('filters.bbox', 'array required for filters.bbox').optional().isArray();
  return next();
}

router.post('/occupancy/timeserie',
  occTimeserieValidator,
  responseValidator,
  auth.validateVariables(
    [
      'traffic.bikehiredockingstation.freeslotnumber',
      'traffic.bikehiredockingstation.totalslotnumber'
    ]),
  function(req, res, next) {
    var opts = {
      scope: req.scope,
      time: req.body.time || {},
      filters: req.body.filters || {},
      csv: req.body.csv || false
    }
    new TrafficModel().getOccTimeserie(opts)
    .then(new BaseFormatter().pipe)
    .then(function(data) {
      if (opts.csv) {
        res.set('Content-Type', 'text/csv');
        res.send(new CSVFormatter().formatTimeSerie(data))
      }
      else {
        res.json(data)
      }
    })
    .catch(function(err) {
      log.error(err);
      res.status(400).json(err);
    });
  });



var scatterDailyValidators = function(req, res, next) {
  req.checkBody('time.start', 'required').notEmpty();
  req.checkBody('time.finish', 'required').notEmpty();
  req.checkBody('filters', 'required').optional();
  req.checkBody('filters.bbox', 'array required').optional().isArray();

  return next();
}

router.post('/availability/scatter/daily',
  scatterDailyValidators,
  responseValidator,
  auth.validateVariables(
    [
      'traffic.bikehiredockingstation.availablebikenumber'
    ]),
  function(req, res, next) {
    var opts = {
      weekend: req.body.weekend || false,
      scope: req.scope,
      start: req.body.time.start,
      finish: req.body.time.finish,
      filters: req.body.filters || {'condition': {}},
      bbox: req.body.filters ? req.body.filters.bbox : undefined
    };

    var model = new TrafficModel();
    model.getAvailableDailyScatter(opts)
    .then(new ScatterFormatter().withOk)
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      log.error('Daily scatter: Error when selecting data');
      log.error(err);
      res.status(400).json(err);
    });
  });


module.exports = router;
