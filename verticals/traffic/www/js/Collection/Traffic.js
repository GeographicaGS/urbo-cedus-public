App.Collection.Traffic.PanelList = Backbone.Collection.extend({
  initialize: function(models,options) {
    var base = '/' + options.scopeModel.get('id') + '/' + options.id_category;
    var _verticalOptions = [{
        id : 'master',
        title: __('Estado General'),
        url:base + '/dashboard',
      }
    ];

    App.mv().validateInMetadata({'entities': ['traffic.trafficflowobserved']})
    && _verticalOptions.push({
      id : 'current',
      title: __('Tiempo real'),
      url:base + '/dashboard/current',
    });

    App.mv().validateInMetadata({'entities': ['traffic.bikehiredockingstation']})
    && _verticalOptions.push({
        id: 'bikes',
        title: __('Bicicletas: tiempo real'),
        url:base + '/dashboard/bikes',
    });

    App.mv().validateInMetadata({'entities': ['traffic.bikehiredockingstation']})
    && _verticalOptions.push({
        id: 'analysis',
        title: __('Bicicletas: análisis de uso'),
        url:base + '/dashboard/analysis',
    });

    this.set(_verticalOptions);
  }
});
App.Utils.Traffic.calculatedValue = function(realValue,c) {
  return (Math.pow((1/100)*realValue, c)) * 100;
},

App.Static.Collection.Traffic.VariablesForSelector =  new Backbone.Collection([
  {id: 'intensity_ratio', name: __('Intensidad')},
  {id: 'load', name: __('Carga')},
  {id: 'occupancy', name: __('Ocupación')},
  {id: 'service_level', name: __('Nivel de servicio')},
  {id: 'intensity_relative_ratio', name: __('Intensidad relativa')},
  {id: 'load_relative_ratio', name: __('Carga relativa')},
  {id: 'occupancy_relative_ratio', name: __('Ocupación relativa')},
]);

App.Static.Collection.Traffic.CongestedLevel =  new Backbone.Collection([
  {id: '1', name: 'level1', color: '#FFAA2A'},
  {id: '2', name: 'level2', color: '#FF8F21'},
  {id: '3', name: 'level3', color: '#FF7519'},
  {id: '4', name: 'level4', color: '#FF5A10'},
  {id: '5', name: 'level5', color: '#FF2500'},
]);

App.Static.Collection.Traffic.ServiceLevel =  new Backbone.Collection([
  {id: '0', cid: 'fluid', name: __('Fluido'), color: '#58BC8F'},
  {id: '1', cid: 'slow', name: __('Lento'), color: '#FFAA2A'},
  {id: '2', cid: 'heavy', name: __('Retenciones'), color: '#FF7519'},
  {id: '3', cid: 'congested', name: __('Congestión'), color: '#FF2500'},
]);

App.Static.Collection.Traffic.Averages =  new Backbone.Collection([
  {id: '0', cid: 'fluid', name: __('Mucho menos que la media'), color: '#58BC8F', greaterOrEqualThan: 0, menosThan: 0.2},
  {id: '1', cid: 'stable', name: __('Menos que la media'), color: '#ACB35D', greaterOrEqualThan: 0.2, lessThan: 0.4},
  {id: '2', cid: 'slow', name: __('En la media'), color: '#FFAA2A', greaterOrEqualThan: 0.4, lessThan: 0.6},
  {id: '3', cid: 'heavy', name: __('Más que la media'), color: '#FF7519', greaterOrEqualThan: 0.6, lessThan: 0.8},
  {id: '4', cid: 'congested', name: __('Mucho más que la media'), color: '#FF2500', greaterOrEqualThan: 0.8, lessThan: 1},
]);

App.Static.Collection.Traffic.Incidences =  new Backbone.Collection([
  {id: 1, cid: 'roadworks', name: __('Obra')},
  {id: 2, cid: 'accident', name: __('Accidente')},
  {id: 3, cid: 'alert', name: __('Alerta')},
  {id: 4, cid: 'event', name: __('Evento')},
  {id: 5, cid: 'upcoming', name: __('Previsión')},
]);

App.Static.Collection.Traffic.IntensityLevel =  new Backbone.Collection([
  {id: '0', cid: 'fluid', name: __('Fluido'), color: '#58BC8F', greaterOrEqualThan: 0, lessThan: 25},
  {id: '1', cid: 'stable', name: __('Estable'), color: '#ACB35D', greaterOrEqualThan: 25, lessThan: 50},
  {id: '2', cid: 'slow', name: __('Lento'), color: '#FFAA2A', greaterOrEqualThan: 50, lessThan: 75},
  {id: '3', cid: 'heavy', name: __('Retenciones'), color: '#FF7519', greaterOrEqualThan: 75, lessThan: 100},
  {id: '4', cid: 'congested', name: __('Congestión'), color: '#FF2500', greaterOrEqualThan: 100},
]);
