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

App.View.Widgets.Schools.SummaryValues = App.View.Widgets.Base.extend({

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

    this.collection.url = 'https://jsonplaceholder.typicode.com/users';

    this.collection.parse = function(response) {
      var response = {
        "schools.internships": {
          "total": "50",
          "total_filter": "45",
        },
        "schools.companies": {
          "total": "15",
          "total_filter": "45",
        },
        "schools.schools": {
          "total": "4",
          "total_filter": "45",
        }
      };

      _.each(response, function(___, entity) {
        response[entity] = response[entity].total;
      });
      return response;
    };
    
    this.subviews.push(new App.View.Widgets.MultipleVariable({
      collection: this.collection, 
      variables: [
        {
          label: 'Available Internships',
          param: 'schools.internships',
          nbf: App.nbf,
        },
        {
          label: 'Total schools',
          param: 'schools.schools',
          nbf: App.nbf,        
        },
        {
          label: 'Total companies',
          param: 'schools.companies',
          nbf: App.nbf,        
        }],
    }));

    this.filterables = [this.collection];
  },
});
