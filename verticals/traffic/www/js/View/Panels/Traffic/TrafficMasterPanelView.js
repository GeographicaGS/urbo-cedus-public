'use strict';

App.View.Panels.Traffic.Master = App.View.Panels.Base.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'traffic',
      spatialFilter: false,
      master: false,
      title: __('Estado General'),
      id_panel: 'master',
      filteView: false,
      framesList: true
    });
    App.View.Panels.Base.prototype.initialize.call(this, options);

    this.render();
  },

  customRender: function() {
    this._widgets = [];

    var m = new App.Model.Widgets.Base({
      entities : ['traffic.trafficflowobserved'],
      location : this.scopeModel.get('location'),
      zoom: this.scopeModel.get('zoom'),
      scope: this.scopeModel.get('id'),
      section: this.id_category,
      color: App.mv().getAdditionalInfo(this.id_category).colour,
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/current',
      title: __('Tráfico - Mapa'),
      timeMode:'now',
      titleLink: __('Tiempo Real')
    });

    App.mv().validateInMetadata({'entities': ['traffic.trafficflowobserved']})
    && this._widgets.push(new App.View.WidgetDeviceMap({model: m}));

    this._widgets.push(new App.View.Widgets.Traffic.TrafficIntensityValues({
      id_scope: this.scopeModel.get('id'),
      timeMode:'now',
      permissions: {'entities': ['traffic.trafficflowobserved']},
      // link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/historic',
      // titleLink: __('Histórico')
    }));

    var bikes = new App.Model.Widgets.Base({
      entities : ['traffic.bikehiredockingstation'],
      location : this.scopeModel.get('location'),
      zoom: this.scopeModel.get('zoom'),
      scope: this.scopeModel.get('id'),
      section: this.id_category,
      color: App.mv().getAdditionalInfo(this.id_category).colour,
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/bikes',
      title: __('Bicicletas - Tiempo Real'),
      timeMode:'now',
      titleLink: __('Tiempo real')
    });

    // Only map
    App.mv().validateInMetadata({'entities': ['traffic.bikehiredockingstation']})
    && this._widgets.push(new App.View.WidgetDeviceMap({model: bikes}));

    this._widgets.push(new App.View.Widgets.Traffic.AvailableBikesRatePie({
      permissions: {'entities': ['traffic.bikehiredockingstation']},
      id_scope: this.scopeModel.get('id')
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$(".widgets")
    }));

  },
});
