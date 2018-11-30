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

App.View.Widgets.Traffic.FreeOccupancyRateEvolution = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Evolución de bicicletas disponibles y alquiladas · Porcentaje de uso'),
      timeMode:'historic',
      id_category: 'traffic',
      dimension: 'allWidth',
      exportable: true,
      publishable: true,
      classname: 'App.View.Widgets.Traffic.FreeOccupancyRateEvolution'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);


    this.collection = new App.Collection.Post([],{
      data: {
        time: {
          start: App.ctx.getDateRange().start,
          finish: App.ctx.getDateRange().finish,
          step: '1d'
        },
        filters: App.ctx.get('bbox_status') && App.ctx.get('bbox') ? { bbox: App.ctx.get('bbox') } : {}
      },
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/traffic/occupancy/timeserie'
    this.collection.parse = App.Collection.Variables.Timeserie.prototype.parse;

    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function(d,i){
        switch(d.realKey){
          case 'occupancy': return '#ffcc00';
          case 'available': return '#1cb183';
          case 'occupied': return '#0066ff';
        }
      },
      legendNameFunc: function(d){
        var map = {
          'occupancy': __('Ocupación (%)'),
          'available': __('Bicicletas disponibles'),
          'occupied': __('Bicicletas alquiladas'),
        }
        return map[d];
      },
      xAxisFunction: function(d) { return App.formatDate(d,'DD/MM HH:mm'); },
      yAxisFunction: [
        function(d) { return App.nbf(d, {decimals: 0})},
        function(d) { return App.nbf(d, {decimals: 0})}
      ],
      yAxisLabel: [__('Ocupación (%)'),__('Número de bicicletas')],
      yAxisDomain: [[0,100],[0,1]],
      currentStep: '1d',
      keysConfig: {
        'occupancy': {type: 'line', axis: 1},
        'available': {type: 'bar', axis: 2},
        'occupied': {type: 'bar', axis: 2}
      },
      legendOrderFunc: function(d){
        var idx = ['occupancy','occupied','available'].indexOf(d);
        if(idx === -1) idx = 99;
        return idx;
      },
      stacked:true
    });

    // this.subviews.push(new App.View.Widgets.Charts.MultiChart({
    this.subviews.push(new App.View.Widgets.Charts.D3.BarsLine({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },
});
