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

App.View.Map.Traffic.Evolution = App.View.Map.Base.extend({

  _selectorTemplate: _.template( $('#traffic-map_selector_agg_template').html() ),
  _popupTemplate: _.template( $('#traffic-evolution_popup_template').html()),

  _popupTemplateMini: _.template( $('#traffic-bikes_evolution_map_popup_mini_template').html() ),

  initialize: function(options){
    options = _.defaults(options,{
      timeMode: 'historic',
      title: __('Porcentaje de uso de bicicletas'),
      infoTemplate: $('#traffic-map_info_evolution_template').html(),
      legendTemplate: $('#traffic-map_legend_evolution_template').html()
    });

    App.View.Map.Base.prototype.initialize.call(this,options);

    this._offStreetIntervalId = null;
    this._timeoutRender = 15000;

    this._baseLayer = null;
    this._offStreetLayer = null;
    this._username = App.Utils.getCartoAccount(this.options.id_category);
    _.bindAll(this,'_onParkingPolyClick', '_onAreaOver' ,'_onCreatedOffStreet');

    this._popupTemplateMiniArea = _.template('<div class="popup hover"><div class="content summary"><p><span class="title" style="text-transform: none;">' + __('Porcentaje de ocupación') + '</span><span><%= App.nbf(data.perc)%>%</span></p></div></div>');
  },

  onClose: function(){
    App.View.Map.Base.prototype.onClose.call(this);
    if (this._baseLayer)
      this.map.removeLayer(this._baseLayer);
    if (this._offStreetLayer)
      this.map.removeLayer(this._offStreetLayer);
    if (this._offStreetIntervalId)
      clearInterval(this._offStreetIntervalId);
  },

  events: {
    'click .parking_selector .current': '_toggleSelector',
    'click .parking_selector .genericPopup li' : '_changeAgg'
  },

  // No need to deal with it
  changeBBOX: function(){},
  // No need to deal with it
  changeDate: function(){},

  render: function(){
    App.View.Map.Base.prototype.render.call(this);

    this.map.setZoom(13);

    cartodb.createLayer(this.map, {
      user_name: this._username,
      type: 'namedmap',
      named_map: {
        name: App.config.maps_prefix + 'traffic_bikes_evo',
        layers: [{
          layer_name: "t1",
          interactivity: "cartodb_id"
        },
        {
          layer_name: "t2",
          interactivity: "cartodb_id"
        },
        {
          layer_name: "t3",
          interactivity: "cartodb_id"
        },
        {
          layer_name: "t4",
          interactivity: "cartodb_id"
        },
        {
          layer_name: "t5",
          interactivity: "cartodb_id"
        }]
      }
    },{ https: true}).addTo(this.map)
    .done(this._onNamedMapCreated);

    return this;
  },

  _onFeatureClick: function(e, pos, pixel, data, sublayer, showLink) {
    App.View.Map.Base.prototype._onFeatureClick.call(this, e, pos, pixel, data, sublayer, showLink);
    $('.parking_selector .label').text(data.name);
  },

  _onParkingPolyClick: function(e, pos, pixel, data, sublayer) {
    this._onFeatureClick(e, pos, pixel, data, sublayer, false);
  },

  _onAreaOver:function(e, pos, pixel, data) {
    if(!this.map.hasLayer(this._popupHover) && !this.map.hasLayer(this._popup)){
      this._popupHover
        .setLatLng(pos)
        .setContent(this._popupTemplateMiniArea({data: data}))
        .openOn(this.map);
    }else if(this.map.hasLayer(this._popupHover)){
      this._popupHover
        .setLatLng(pos)
        .setContent(this._popupTemplateMiniArea({data: data}))
        .update();
    }
  },

  _hoverFeatureContent: function(e, pos, pixel, data, sublayer){
    return this._popupTemplateMini({data: data});
  },

  _onNamedMapCreated: function(layer){
    App.View.Map.Base.prototype._onNamedMapCreated.apply(this,[layer]);

    var _this = this;

    this._baseLayer = layer;

    if (!this._popup) this._popup = L.popup();
    if (!this._popupHover) this._popupHover = L.popup({
      className: 'hoverPopup',
      closeButton: false
    });


    // 0 = OffStreetPolygon
    layer.getSubLayer(0).setInteraction(true);
    layer.getSubLayer(0).on('featureClick',this._onFeatureClick);
    layer.getSubLayer(0).on('featureOver',this._onFeatureOver);
    // 1 = OnStreetPolygon
    layer.getSubLayer(1).setInteraction(true);
    layer.getSubLayer(1).on('featureOver',this._onFeatureOver);
    layer.getSubLayer(1).on('featureClick',this._onFeatureClick);
    // 2 = OnStreetGroup
    layer.getSubLayer(3).setInteraction(true);
    layer.getSubLayer(3).on('featureOver',this._onFeatureOver);
    // // 4 = OffStreetPoints
    layer.getSubLayer(5).setInteraction(true);
    layer.getSubLayer(5).on('featureOver',this._onFeatureOver);
    layer.getSubLayer(5).on('featureClick',this._onFeatureClick);

    layer.getSubLayer(2).setInteraction(true);
    layer.getSubLayer(2).on('featureOver',this._onAreaOver);

    // layer.on('mouseout', this._onParkingOut);
    layer.getSubLayer(1).on('mouseout', this._onFeatureOut);
    layer.getSubLayer(5).on('mouseout', this._onFeatureOut);
    layer.getSubLayer(2).on('mouseout', this._onFeatureOut);

    this.map.on('zoomend', function () {
      if(_this.map.getZoom() <= 14)
        layer.getSubLayer(2).show();
        // layer.getSubLayer(2).setInteraction(true);
      else
        // layer.getSubLayer(2).setInteraction(false);
        layer.getSubLayer(2).hide();
    });

    this.setLayerCursor(layer);

    this._baseLayer.setParams(this._getParams());
  },

  _getParams: function(){
    return {
      start: App.ctx.getDateRange().start,
      finish : App.ctx.getDateRange().finish,
      agg: this.$('.parking_selector .genericPopup li.active').attr('value')
    };
  },

  changeDate:function(){
    this._baseLayer.setParams(this._getParams());
  },

  _changeAgg: function(e){
    this.$('.parking_selector .current span').text($(e.currentTarget).text());
    this.$('.parking_selector .current span').removeClass()
    this.$('.parking_selector .current span').addClass($(e.currentTarget).attr('class'));

    this.$('.parking_selector .genericPopup li').removeClass('active');
    $(e.currentTarget).addClass('active');

    this._baseLayer.setParams(this._getParams());
  },

  _clickFeatureContent: function(e, pos, pixel, data, sublayer, showLink){
    // var explore = showLink !== undefined ? showLink : sublayer !== 1; // Sublayer 1 is the onstreet layer
    return this._popupTemplate({data: data, explore: false, now: false, agg: __('Total')});
  },

  _toggleSelector:function(){
    this.$('.parking_selector .genericPopup').toggleClass('active');
  },

  _onCreatedOffStreet: function(layer){
    this._offStreetLayer = layer;

    // 0 = ParkingPolygon
    layer.getSubLayer(0).setInteraction(true);
    layer.getSubLayer(0).on('featureClick',this._onParkingPolyClick);
    layer.getSubLayer(0).on('featureOver',this._onFeatureOver);
    // // 1 = ParkingGroup
    layer.getSubLayer(1).setInteraction(true);
    layer.getSubLayer(1).on('featureOver',this._onFeatureOver);
    // // 2 = Spots
    layer.getSubLayer(2).setInteraction(true);
    layer.getSubLayer(2).on('featureOver',this._onFeatureOver);

    layer.getSubLayer(0).on('mouseout', this._onFeatureOut);
    layer.getSubLayer(1).on('mouseout', this._onFeatureOut);
    layer.getSubLayer(2).on('mouseout', this._onFeatureOut);

    this.setLayerCursor(layer);
    this._changeFloor();

  }

});
