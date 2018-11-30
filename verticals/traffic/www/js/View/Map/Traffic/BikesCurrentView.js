'use strict';

App.View.Map.Traffic.Bikes = App.View.Map.Base.extend({
  _popupTemplate: _.template( $('#traffic-bikes_popup_template').html() ),
  _popupTemplateMini: _.template( $('#traffic-bikes_popup_mini_template').html() ),

  _torqueSqlTemplate: _.template( $('#traffic-torque_bikes_now_sql').html()),
  _torqueAlertCartoCSSTemplate: _.template( $('#traffic-torque_bikes_now_cartocss').html() ),

  initialize: function(options) {

    options = _.defaults(options,{
      timeMode: 'now',
      slug: 'bikes_now',
      title: __('Alquiler de bicicletas: tiempo real'),
      infoTemplate: $('#traffic-bikes_info_template').html(),
      legendTemplate: $('#traffic-bikes_legend_template').html()
    });

    App.View.Map.Base.prototype.initialize.call(this,options);

    this._baseLayer = null;
    this._torqueLayer = null;
  },

  events: {
  },

  onClose: function(){
    App.View.Map.Base.prototype.onClose.call(this);
    if (this._baseLayer)
      this.map.removeLayer(this._baseLayer);
  },

  // No need to deal with it
  changeBBOX: function(){},
  // No need to deal with it
  changeDate: function(){},

  _getFiltersParams: function(){
    var r = {
      scope : this.options.scope
    };

    return r;
  },

  applyFilters: function(){
    var params = this._getFiltersParams();

    if (this._baseLayer)
      this._baseLayer.setParams(params);

    if (this._torqueLayer)
      this._torqueLayer.setSQL(this._torqueSqlTemplate(params));
  },

  render: function(){
    App.View.Map.Base.prototype.render.call(this);

    this.map.setZoom(13);

    cartodb.createLayer(this.map, {
      user_name: this._username,
      type: 'namedmap',
      named_map: {
        name: App.config.maps_prefix + 'traffic_bikes_now',
        layers: [
          {
            layer_name: "tr2",
            interactivity: "cartodb_id"
          }
        ]
      }
    },{ https: true}).addTo(this.map)
    .done(this._onNamedMapCreated);


    var _this = this;
    var sql = this._torqueSqlTemplate(this._getFiltersParams());
    var css = this._torqueAlertCartoCSSTemplate();
    var username = this._username;

    cartodb.createLayer(this.map, {
        type: "torque",
        options: {
            query: sql,
            user_name:  username,
            cartocss: css
        }
    },{https: true, time_slider: false})
    .addTo(this.map)
    .done(function(layer) {
      layer.setZIndex(1);
      _this._torqueLayer = layer;

    }).error(function(err){
      console.error(err);
    });


    return this;
  },

  _onNamedMapCreated: function(layer){

    App.View.Map.Base.prototype._onNamedMapCreated.apply(this,[layer]);

    this._baseLayer = layer;
    this._baseLayer.setZIndex(2);
    layer.setParams({
      'scope': this.options.scope
    });

    layer.getSubLayer(0).setInteraction(true);
    layer.getSubLayer(0).on('featureClick',this._onFeatureClick);
    layer.getSubLayer(0).on('featureOver',this._onFeatureOver);
    layer.getSubLayer(0).on('featureOut', this._onFeatureOut);

    this.setLayerCursor(layer);

    this.applyFilters();
  },

  _hoverFeatureContent: function(e, pos, pixel, data, sublayer){
    return this._popupTemplateMini({data: data});
  },

  _clickFeatureContent: function(e, pos, pixel, data, sublayer, showLink){

    return this._popupTemplate({
      data: data,
      pos: pos,
      now: true,
      agg: __('Total'),
      scope:this.options.scope
    });
  },


});
