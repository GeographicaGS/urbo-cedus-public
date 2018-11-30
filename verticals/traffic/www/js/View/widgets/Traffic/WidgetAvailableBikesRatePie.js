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

App.View.Widgets.Traffic.AvailableBikesRatePie =  App.View.Widgets.Base.extend({

  // _legend_template : _.template("<div class='extra_info'><div class='bad'><span class='icon circle bad'></span><span class='text_icon bad'>Plazas ocupadas</span></div><div class='good'><span class='icon circle good'></span><span class='text_icon regular'>Plazas libres</span></div></div>"),

  initialize: function(options) {

    //Hay que crear aqui el _legend_template para que esté la función de traducción disponible
    this._legend_template = _.template("<div class='extra_info'><div class='bad'><span class='icon circle green'></span><span class='text_icon bad'>" + __('Bicicletas disponibles') + "</span></div><div class='good'><span class='icon circle blue'></span><span class='text_icon regular'>" + __('Bicicletas alquiladas') + "</span></div></div>"),
    options = _.defaults(options,
      {
        title:__('Bicicletas disponibles y alquiladas'),
        timeMode:'now',
        id_category: 'traffic',
        titleLink:__('Evolución del estacionamiento'),
        permissions: {'entities': ['traffic.bikehiredockingstation']},
        publishable: true,
        classname: 'App.View.Widgets.Traffic.AvailableBikesRatePie'
      }
    );
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    if(!this.hasPermissions()) return;

    this.collection = new App.Collection.Histogram([],{
      data : {
        filters: {}
      }
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/traffic/available/histogram/discrete/now';

    this._chartModel = new App.Model.BaseChartConfigModel({
      img: '/verticals/traffic/img/SM_icwidget_bikes.svg',
      colors: ['#1EB779', '#0066FF'],
      legendTemplate: this._legend_template,
      legendNameFunc: function(d){
        var map = {
          'availablebikenumber': __('Bicicletas disponibles'),
          'rentedbikenumber': __('Bicicletas alquiladas')
        }
        return map[d];
      },
      showTotal: true
    });

    this.subviews.push(new App.View.Widgets.Charts.Pie({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];

  },
});
