// Copyright 2017 Telefónica Digital España S.L.
//
// PROJECT: urbo-telefonica
//
// This software and / or computer program has been developed by
// Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as
// copyright by the applicable legislation on intellectual property.
//
// It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
// reproduction, distribution, public communication and transformation, and any economic
// right on it, all without prejudice of the moral rights of the authors mentioned above.
// It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
// otherwise transmit by any means, translate or create derivative works of the software and
// / or computer programs, and perform with respect to all or part of such programs, any
// type of exploitation.
//
// Any use of all or part of the software and / or computer program will require the
// express written consent of Telefónica Digital. In all cases, it will be necessary to make
// an express reference to Telefónica Digital ownership in the software and / or computer
// program.
//
// Non-fulfillment of the provisions set forth herein and, in general, any violation of
// the peaceful possession and ownership of these rights will be prosecuted by the means
// provided in both Spanish and international law. Telefónica Digital reserves any civil or
// criminal actions it may exercise to protect its rights.

'use strict';

App.View.Widgets.Traffic.TrafficIntensityValues = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Intensidad del tráfico'),
      timeMode:'now',
      id_category: 'traffic',
      refreshTime : 80000,
      publishable: true,
      classname: 'App.View.Widgets.Traffic.TrafficIntensityValues'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    if(!this.hasPermissions()) return;

    _.bindAll(this,'_changeVariable');
    this.listenTo(options.customFilterModel, 'change:variable', this._changeVariable);

    this.collection = new App.Model.Variables({
      scope: this.options.id_scope,
      mode: this.options.timeMode,
      variable: 'traffic.trafficflowobserved.intensity',
      data: {
        agg: ["min","avg","max"],
        filters: {
          bbox: this.ctx.getBBOX()
        }
      }
    });

    this.collection.fetch = function(options) {
      options.data = _.defaults(this.options.data,options.data);
      this.constructor.__super__.fetch.call(this, options);
    }

    this.collection.parse = function(response) {
      return response.value;
    };

    this.subviews.push(new App.View.Widgets.MultipleVariable({
      collection: this.collection, 
      variables: [
        {
          label: 'Valor máximo',
          param: 'max',
          class: 'max',
          nbf: App.nbf,
          units: this.checkUnit.bind(this)
        },
        {
          label: 'Valor medio',
          param: 'avg',
          class: 'avg',
          nbf: App.nbf,        
          units: this.checkUnit.bind(this)
        },
        {
          label: 'Valor mínimo',
          param: 'min',
          class: 'min',
          nbf: App.nbf,        
          units: this.checkUnit.bind(this)
        }],
    }));

    this.filterables = [this.collection];
  },

  _changeVariable: function(e) {
    var variable = e.get('variable');
    if (variable === 'intensity_ratio' || variable === 'intensity_relative_ratio') {
      variable = 'intensity';
      this.model.set('title', __('Intensidad del tráfico'))
    } else if(variable === 'load' || variable === 'load_relative_ratio') {
      variable = 'load';            
      this.model.set('title', __('Carga de las vías'))      
    } else if (variable === 'occupancy' || variable === 'occupancy_relative_ratio') {
      variable = 'occupancy';            
      this.model.set('title', __('Ocupación de las vías'))      
    } else {
      variable = 'intensity';
      this.model.set('title', __('Intensidad del tráfico'))      
    }

    this.collection.set('variable', 'traffic.trafficflowobserved.' + variable);
    this.collection.options.variable = 'traffic.trafficflowobserved.' + variable;
    this.refresh();
  },

  checkUnit: function() {
    var unit = '%';
    if (!this.options.customFilterModel || 
      this.options.customFilterModel.get('variable') === 'service_level' ||
      this.options.customFilterModel.get('variable') === 'intensity_ratio' ||
      this.options.customFilterModel.get('variable') === 'intensity_relative_ratio') {
      unit = 'veh/h';
    }
    return unit;
  }
});
