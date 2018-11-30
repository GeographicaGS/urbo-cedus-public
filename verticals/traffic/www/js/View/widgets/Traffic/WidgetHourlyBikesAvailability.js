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

App.View.Widgets.Traffic.HourlyBikesAvailability = App.View.Widgets.Base.extend({
  _template_tooltip: _.template( $('#chart-base_charttooltip_with_id').html() ),

  initialize: function (options) {
    options = _.defaults(options,{
      title: __('Distribución horaria de la disponibilidad de bibicletas'),
      timeMode:'historic',
      id_category: 'traffic',
      dimension: 'allWidth',
      infoTemplate: _.template($('#traffic-hourly_bikes_availability_help').html()),
      publishable: true,
      classname: 'App.View.Widgets.Traffic.HourlyBikesAvailability'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    // Skip more code if widget is not allowed
    if(!this.hasPermissions()) return;

    this.collection = new App.Collection.Scatter([], {
      scope: this.options.id_scope,
      entity_id: 'traffic',
      feature: 'availability',
      mode: 'daily',
      data: {
        time: {
          start: App.ctx.getDateRange().start,
          finish: App.ctx.getDateRange().finish
        },
        filters: {
          bbox: App.ctx.get('bbox_status') && App.ctx.get('bbox') ? App.ctx.get('bbox') : {}
        }
      }
    });

    this._chartModel = new App.Model.BaseChartConfigModel({
      xAxisFunction: function (d) {
        var duration = moment.duration(d, 'seconds');
        return moment.utc(duration.asMilliseconds()).format('HH:mm') + ' h';
      },
      yAxisLabel: __('% de disponibilidad'),
      xAxisShowMaxMin: true,
      xAxisDomain: [0, 86399],
      colors: function (d, i) {
        switch (d.realKey) {
          case 'ok': return '#169B73';
        }
      },
      legendNameFunc: function(d){
        var map = {
          'ok': __('Porcentaje de disponibilidad / estación')
        }
        return map[d];
      },
      legendOrderFunc: App.Utils.rangeOrder,
      tooltipTemplate: this._template_tooltip
    });


    this._chartModel.set({yAxisDomain: [0, 100]});


    this.subviews.push(new App.View.Widgets.Charts.Scatter({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  }
});
