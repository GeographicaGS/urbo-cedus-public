'use strict';

App.View.Widgets.Traffic.CongestedRoadsStacked = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Vías congestionadas monitorizadas'),
      timeMode:'now',
      id_category: 'traffic',
      refreshTime : 80000,
      publishable: true,
      classname: 'App.View.Widgets.Traffic.CongestedRoadsStacked'
    });
    var _this = this;
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    if(!this.hasPermissions()) return;

    this.collection = new App.Collection.Histogram([],{
      scope: this.options.id_scope,
      variable: 'traffic.trafficflowobserved.intensity_ratio',
      type: 'continuous',
      mode: 'now',
      data : {
        ranges: [
          { '<': App.Utils.Traffic.calculatedValue(25,1)},
          { '>=': App.Utils.Traffic.calculatedValue(25,1), '<': App.Utils.Traffic.calculatedValue(50,1) },
          { '>=': App.Utils.Traffic.calculatedValue(50,1), '<': App.Utils.Traffic.calculatedValue(75,1) },
          { '>=': App.Utils.Traffic.calculatedValue(75,1), '<': App.Utils.Traffic.calculatedValue(100,1) },
          { '>=': App.Utils.Traffic.calculatedValue(100,1) },          
        ],
        filters: {}
      }
    });
    

    this.collection.parse = function(response) {
      // VALID TRANFORMATION 
      var i = 0;
      var total = 0;
      var totalCongested = 0;
      var elements = {};
      _.each(response, function(step) {
        total += parseInt(step.value);
        totalCongested += (i > 1) ? parseInt(step.value) : 0;
        elements[i++] = parseInt(step.value);
      });

      delete elements[0];
      delete elements[1];
      _this.totalCongested = App.nbf((totalCongested * 100) / total);
      _this._chartModel.set({yAxisDomain: [0,total]});
      return [{step: null,elements: elements}];
    };

    this._chartModel = new App.Model.BaseChartConfigModel({
      stacked: true,
      colors: function(d,index){
        return App.Static.Collection.Traffic.CongestedLevel.get(d.realKey).get('color');
      },
      xAxisFunction: function (d) {
        return __('Nivel de servicio');
      },
      yAxisLabel: __('Vías monitorizadas'),
      legendTemplate: function(d) {
        return '<div class="congested congestion"></div> <span class="label">' + __('Vías congestionadas') +  ':</span>' +
                '<span class="value">' + _this.totalCongested + '%</span>';
      },
      legendNameFunc: function(d) {
        return App.Static.Collection.Traffic.IntensityLevel
          .toJSON()[parseInt(d)].name;
      },
      legendNameFunc: function(d) {
        return App.Static.Collection.Traffic.IntensityLevel
          .toJSON()[parseInt(d)].name;
      },
      yAxisFunction:  function(d) {
        return App.nbf(d)
      },
      formatYAxis: {
        tickFormat: function (d) {
          var value = App.nbf(d, {decimals: 2, compactK: true});
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

  _onChangeFilter: function(e) {
    if (e.changed.hasOwnProperty('c')) {
      this.collection.options.data.ranges = [
        { '<': App.Utils.Traffic.calculatedValue(25, e.get('c'))},
        { '>=': App.Utils.Traffic.calculatedValue(25, e.get('c')), '<': App.Utils.Traffic.calculatedValue(50, e.get('c')) },
        { '>=': App.Utils.Traffic.calculatedValue(50, e.get('c')), '<': App.Utils.Traffic.calculatedValue(75, e.get('c')) },
        { '>=': App.Utils.Traffic.calculatedValue(75, e.get('c')), '<': App.Utils.Traffic.calculatedValue(100, e.get('c')) },
        { '>=': App.Utils.Traffic.calculatedValue(100, e.get('c')) },          
      ];
      
      App.View.Widgets.Base.prototype._onChangeFilter.call(this);
    }
  }
});
