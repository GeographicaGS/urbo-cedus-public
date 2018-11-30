'use strict';

App.View.Map.Traffic.Heatmap = App.View.Map.MapboxView.extend({
  initialize: function (options) {
    var center = App.mv().getScope(App.currentScope).get('location');
    options = _.defaults(options, {
      defaultBasemap: 'positron',
      sprites: '/verticals/traffic/mapstyle/sprite',
      center: [center[1],center[0]],
      zoom: 12,
      type: 'now',
      autoRefresh: 80000
    });

    App.View.Map.MapboxView.prototype.initialize.call(this, options);
    this.variableSelector = new App.View.Map.VariableSelector({
      filterModel: this.filterModel,
      variables: [
        {value: 'intensity_ratio', name: __('Intensidad'), byDefault: true},
        {value: 'load', name: __('Carga')},
        {value: 'occupancy', name: __('Ocupación')},
        {value: 'service_level', name: __('Nivel de servicio')},
        {value: 'intensity_relative_ratio', name: __('Intensidad relativa')},
        {value: 'load_relative_ratio', name: __('Carga relativa')},
        {value: 'occupancy_relative_ratio', name: __('Ocupación relativa')},
      ]
    });

    this.$el.append(this.variableSelector.render().$el)
  },

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Traffic.HeatMapLayer(this._options, this._payload, this);
  },

  _applyFilter: function(filter) {
    this.layers.updateSQL(filter)
  },

  _onBBoxChange: function(bbox) {
    if (App.ctx.get('bbox_status')) {
      let __bbox = [bbox.getNorthEast().lng,bbox.getNorthEast().lat,bbox.getSouthWest().lng,bbox.getSouthWest().lat]
      App.ctx.set('bbox', __bbox);
    }
  },

  onClose: function() {
    this.layers.close();
    App.View.Map.MapboxView.prototype.onClose.call(this);
  }
});
