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

App.Collection.Schools.PanelList = Backbone.Collection.extend({
  initialize: function(models,options) {
    var base = '/' + options.scopeModel.get('id') + '/' + options.id_category;
    var _verticalOptions = [{
        id : 'master',
        title: __('Vista general'),
        url:base + '/dashboard',
      },
      {
        id : 'current',
        title: __('Tiempo real'),
        url:base + '/dashboard/current',
      }
    ];

    this.set(_verticalOptions);    
  }
});
App.Utils.Schools.calculatedValue = function(realValue,c) {
  return Math.pow((1/100)*realValue, c) * 100;
},

App.Static.Collection.Schools.InternshipStatus =  new Backbone.Collection([
  {id: 'availables', name: 'Availables', color: '#58BC8F'},
  {id: 'actives', name: 'Actives', color: '#ED7B51'}
]);

App.Static.Collection.Schools.POIsTypes =  new Backbone.Collection([
  {id: 'school', name: 'School', icon: '/verticals/schools/img/school-cartography.svg'},  
  {id: 'company', name: 'Company', icon: '/verticals/schools/img/company-cartography.svg'},
]);