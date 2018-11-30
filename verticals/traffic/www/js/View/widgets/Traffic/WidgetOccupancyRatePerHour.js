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

App.View.Widgets.Traffic.OccupancyRatePerHour = App.View.Widgets.Base.extend({

  initialize: function(options) {

    options = _.defaults(options,{
      title:__('Porcentaje de ocupación por horas'),
      id_category: 'traffic',
      dimension: 'allWidth',
      timeMode:'historic',
      publishable: true,
      classname: 'App.View.Widgets.Traffic.OccupancyRatePerHour'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    this.collection = new App.Collection.Scatter([],{
      scope: this.options.id_scope,
      entity_id: 'traffic',
      feature: 'available_percentage',
      mode: 'daily',
      data: {
        time: {
          start: App.ctx.getDateRange().start,
          finish: App.ctx.getDateRange().finish
        },
        filters: App.ctx.get('bbox_status') && App.ctx.get('bbox') ? { bbox: App.ctx.get('bbox') } : {}
      },
    });

    // TODO: Standardize this!
    this.collection.url = this.collection.url() + '/agg';

    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: App.Utils.ARRAY_COLOR,
      xAxisFunction: function(d) {
        return App.Utils.toHoursAndMinutes(d,'seconds');
      },
      xAxisShowMaxMin: true,
      xAxisDomain: [0,82800],
      yAxisFunction: function(d) { return  App.nbf(d); },
      yAxisLabel: __('Ocupación (%)'),
      legendNameFunc:function(d){
        var map = {
          'min': __('Mínima'),
          'avg': __('Media'),
          'max': __('Máxima')
        }
        return map[d];
      },
      lineClassFunc:function(d){
        var map = {
          'min': '',
          'avg': 'dashed',
          'max': ''
        }
        return map[d];
      },
      legendOrderFunc: function(d){
        var idx = ['min','avg','max'].indexOf(d);
        if(idx === -1) idx = 99;
        return idx;
      },
    });

    this.subviews.push(new App.View.Widgets.Charts.ScatterLine({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];

  }

});
