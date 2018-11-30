'use strict';

App.View.Widgets.Schools.InternshipStatusStacked = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Internship status'),
      timeMode:'now',
      id_category: 'schools',
      refreshTime : 80000,
      publishable: true,
      entity: 'internship',
      classname: 'App.View.Widgets.Schools.InternshipStatusStacked',
    });
    var _this = this;
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    if(!this.hasPermissions()) return;

    var vars = [
      'schools.' + this.options.entity + '.total_places',         
      'schools.' + this.options.entity + '.remaining_places',
    ];

    if (this.options.entity !== 'internship') {
      vars.push('schools.' + this.options.entity + '.company_name');
      vars.push('schools.' + this.options.entity + '.institute_id');                  
    }
    this.collection = new App.Collection.Variables.Ranking([],{
      id_scope: this.options.id_scope,
      data: {
        vars: vars,
        var_order: 'schools.' + this.options.entity + '.total_places',
      },
      mode: 'now'
    });

    this.collection.parse = function(response) {
      var total = 0;
      var availables = 0;

      if (this.options.school) {
        var id = this.options.school.properties.id_entity;
        response = _.filter(response, function(r) {
          return r.institute_id === id;
        });
      }
      _.each(response, function(r) {
        total += r.total_places;
        availables += r.remaining_places;
      });

      // VALID TRANFORMATION 
      var elements = {
        'actives': total - availables,
        'availables': availables
      };

      return [{step: null,elements: elements}];
    }.bind(this);

    this._chartModel = new App.Model.BaseChartConfigModel({
      stacked: true,
      colors: function(d,index){
        return App.Static.Collection.Schools.InternshipStatus.get(d.realKey).get('color');
      },
      legendNameFunc: function (d) {
        return App.Static.Collection.Schools.InternshipStatus.get(d).get('name');        
      },
      xAxisFunction: function (d) {
        return __('All internships');
      },
      yAxisLabel: __('Number of internships'),
      formatYAxis: {
        tickFormat: function (d) {
          var value = App.nbf(d, {decimals:2, compactK: true});
          return value;
        }
      }
    });

    this.subviews.push( new App.View.Widgets.Charts.FillBarStacked({
      'opts': this._chartModel,
      'data': this.collection
    }));

    this.filterables = [this.collection];
  },
});
