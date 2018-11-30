'use strict';

App.View.Widgets.Traffic.RoadTrafficRanking = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Ranking de vías (top 5) por intensidad de tráfico'),
      timeMode:'now',
      id_category: 'traffic',
      refreshTime : 80000,
      publishable: true,
      classname: 'App.View.Widgets.Traffic.RoadTrafficRanking'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    if(!this.hasPermissions()) return;

    _.bindAll(this,'_changeVariable');
    this.listenTo(options.customFilterModel, 'change:variable', this._changeVariable);
    
    this.collection = new App.Collection.Variables.Ranking([], {
      id_scope: this.options.id_scope,
      mode: this.options.timeMode,
      data: {
        vars: [
          "traffic.trafficflowobserved.congested",
          "traffic.trafficflowobserved.id_entity",
          "traffic.trafficflowobserved.description",
          "traffic.trafficflowobserved.intensity"
        ],
        var_order: "traffic.trafficflowobserved.intensity",
        limit: 5
      }
    });


    this.collection.parse = function(e) {
      var variable = this.options.data.var_order.replace('traffic.trafficflowobserved.','');
      _.each(e, function(element) {
        element['variable'] = element[variable];
      });
      return e;
    }

    var _this = this;
    var tableModel = new Backbone.Model({
      css_class: 'transparent rankingWidget',
      csv: false,
      legend: '<div class="footlegend"><div class="congestion congested"></div><span>' + __('Vías monitorizadas congestionadas.') + '</span></div>',
      columns_format:{
        description: {
          css_class:'counter ellipsis',
          formatFN: function(d, e) {
            return !d || d === 'None' ? e.id_entity : d
          }
        },
        variable:{
          title: this.checkUnit.bind(this),
          css_class: "maincolumn",
          formatFN: function(d) {
            var max = 1;
            if (_this.collection.at(0)) {
              max = _this.collection.at(0).get('variable');
            }

            var width = d*100/max;
            d = App.nbf(d);
            var template = _.template('<div class="newRankings intensity"><div class="rankingBar"><div style="width:<%=width%>%"></div></div><span><%= d %></span></div>');
            return template({width: width, d: d});
          }
        },
        congested: {
          css_class: 'led',
          formatFN: function(d) {
            var template = _.template('<div class="congestion <%= congested ? \"congested\":\"\" %>"></div>');
            return template({congested: d});
          }
        }
      }
    });

    this.subviews.push(new App.View.Widgets.TableCustomFilters({
      model: tableModel,
      data: this.collection,
      listenContext: true
    }));

    this.filterables = [this.collection];
  },

  _changeVariable: function(e) {
    var variable = e.get('variable');
    if (variable === 'intensity_ratio' || variable === 'intensity_relative_ratio') {
      variable = 'intensity';
      this.model.set('title', __('Ranking de vías (top 5) por intensidad de tráfico'))
    } else if(variable === 'load' || variable === 'load_relative_ratio') {
      variable = 'load';      
      this.model.set('title', __('Ranking de vías (top 5) por carga'))      
    } else if (variable === 'occupancy' || variable === 'occupancy_relative_ratio') {
      variable = 'occupancy';      
      this.model.set('title', __('Ranking de vías (top 5) por ocupación'))      
    } else {
      variable = 'intensity';
      this.model.set('title', __('Ranking de vías (top 5) por intensidad de tráfico'))
    }
    this.collection.options.data.vars[2] = 'traffic.trafficflowobserved.' + variable;
    this.collection.options.data.var_order = 'traffic.trafficflowobserved.' + variable;
    this.refresh();
  },

  checkUnit: function() {
    var unit = '%';
    if (!this.options.customFilterModel ||
         this.options.customFilterModel.get('variable') === 'intensity_ratio' ||
         this.options.customFilterModel.get('variable') === 'intensity_relative_ratio' ) {
      unit = 'veh/h';
    }
    return unit;
  }
});
