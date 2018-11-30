'use strict';

App.View.Panels.Schools.Master = App.View.Panels.Base.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: false,
      id_category: 'schools',
      spatialFilter: false,
      master: false,
      title: __('Vista general'),
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
      entities : ['schools.institute'],
      location : this.scopeModel.get('location'),
      zoom: this.scopeModel.get('zoom'),
      scope: this.scopeModel.get('id'),
      section: this.id_category,
      color: '#58BC8F',
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/current',
      title: __('Mapa'),
      timeMode:'now',
      titleLink: __('Tiempo Real')
    });

    this._widgets.push(new App.View.WidgetDeviceMap({model: m}));

    this._widgets.push(new App.View.Widgets.Schools.InternshipStatusStacked({
      id_scope: this.scopeModel.get('id'),
      timeMode:'now',
    }));

    this._widgets.push(new App.View.Widgets.Schools.CounterSimple({
      id_scope: this.scopeModel.get('id'),
      title: 'Total institutes',
      variable: 'schools.institute',
      timeMode:'now',
    }));

    this._widgets.push(new App.View.Widgets.Schools.CounterSimple({
      id_scope: this.scopeModel.get('id'),
      title: 'Total companies',
      variable: 'schools.company',
      timeMode:'now',
    }));


    // CUSTOM MODEL FOR INTERNSHIPS AVAILABLES
    var dataModel = new App.Model.Post({
      var_id:"lighting.stcabinet.energyconsumed",
      data:{
        agg:'SUM'
      }
    });

    dataModel.url = App.config.api_url + '/' + this.scopeModel.get('id') + '/variables/schools.internship.remaining_places/now';
    this._widgets.push(new App.View.Widgets.Schools.CounterSimple({
      id_scope: this.scopeModel.get('id'),
      title: 'Available internships',
      timeMode:'now',
      dataModel: dataModel
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$(".widgets")
    }));
  },
});
