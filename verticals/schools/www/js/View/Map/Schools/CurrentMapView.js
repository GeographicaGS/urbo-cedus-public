'use strict';

App.View.Map.Schools.Current = App.View.Map.MapboxView.extend({
  simple_legend_template: _.template($("#Schools-filter-simple_legend_template").html()),
  initialize: function (options) {
    var center = App.mv().getScope(App.currentScope).get('location');
    options = _.defaults(options, {
      defaultBasemap: 'positron',
      sprites: '/verticals/schools/mapstyle/sprite',      
      center: [center[1],center[0]],
      zoom: 8,
      type: 'now'
    });

    App.View.Map.MapboxView.prototype.initialize.call(this, options);
    this.$el.append(this.simple_legend_template())
  },

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Schools.SchoolLayer(this._options, this._payload, this);
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
