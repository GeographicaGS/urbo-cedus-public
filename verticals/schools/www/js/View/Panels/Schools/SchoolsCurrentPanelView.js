'use strict';

App.View.Panels.Schools.Current = App.View.Panels.Splitted.extend({
  _mapInstance: null,
  
  _events: {
    'click .title_selection  a.back': '_goBack'
  },

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: false,
      id_category: 'schools',
      spatialFilter: false,
      master: false,
      title: __('Tiempo real'),
      id_panel: 'current',
      filteView: false,
    });
    App.View.Panels.Splitted.prototype.initialize.call(this, options);

    this.events = _.extend({},this._events, this.events);
    this.delegateEvents();

    this.filterModel = new Backbone.Model({
      status: App.Static.Collection.Schools.POIsTypes.pluck('id'),
      condition: {} // Will be empty, is needed for map's endpoint
    });

    this.render();
  },

  customRender: function() {
    this._widgets = [];

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

    this._widgets.push(new App.View.Widgets.Schools.InternshipStatusStacked({
      id_scope: this.scopeModel.get('id'),
      timeMode:'now',
    }));
    
    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));
  },

  onAttachToDOM: function() {
    this._mapView = new App.View.Map.Schools.Current({
      el: this.$('.top'),
      filterModel: this.filterModel,      
      scope: this.scopeModel.get('id'),
      type: 'historic'
    }).render();


    this.subviews.push(this._mapView);

    this._poisFilter = new App.View.Filter.Schools.PoiMapFilter({
      scope: this.scopeModel.get('id'),
      model: this.filterModel,
      open: true
    });
    this.$el.append(this._poisFilter.render().$el)
    
    this.listenTo(this._mapView.mapChanges,'change:clickedSchool', this._openDetails);
  },

  

  _openDetails: function(e) {
    let clicked = e.toJSON().clickedSchool ? e.toJSON().clickedSchool.features[0] : null;
    if (!clicked) {
      this._goBack();
      return this;
    }

    // 1.- Cleaning widget container
    this.$('.bottom .widgetContainer').html('');

    // 2.- Calling to renderer for detail's widget
    this._customRenderDetails(clicked); 
    $("#titledetail").removeClass('invisible');      
    
    // 3.- Reloading Masonry
    this.$('.bottom .widgetContainer').masonry('reloadItems',{
      gutter: 20,
      columnWidth: 360
    });

    // 4 - Set title of selection
    var $title_selection = $('.title_selection');
    $title_selection.html('<a href="#" class="navElement back"></a>' + clicked.properties.name);
  },

  _goBack: function() {
    // 1.- Cleaning widget container
    this._mapView.mapChanges.set('clickedSchool', null);
    this.$('.bottom .widgetContainer').html('');
    var $title_selection = $('.title_selection');
    $("#titledetail").addClass('invisible'); 
    $title_selection.html('');
    
    // 2.- Calling to render
    this.customRender();
    
    // 3.- Reloading Masonry
    this.$('.bottom .widgetContainer').masonry('reloadItems',{
      gutter: 20,
      columnWidth: 360
    });
  },

  _customRenderDetails: function(residence) {
    this._widgets = [];
    
    var dataModelCourses = new App.Model.Post({
      var_id:"schools.course.name",
      data:{
        agg:'COUNT',
        filters: {
          condition: {'institute_id__eq': residence.properties.id_entity}
        }
      }
    });

    dataModelCourses.url = App.config.api_url + '/' + this.scopeModel.get('id') + '/variables/schools.course.name/now';
    this._widgets.push(new App.View.Widgets.Schools.CounterSimple({
      id_scope: this.scopeModel.get('id'),
      title: 'Total courses',
      school: residence,
      dataModel: dataModelCourses,
      timeMode:'now',
    }));

    var dataModelInternships = new App.Model.Post({
      var_id:"schools.institute_internship.total_places",
      data:{
        agg:'SUM',
        filters: {
          condition: {'institute_id__eq': residence.properties.id_entity}
        }
      }
    });

    dataModelInternships.url = App.config.api_url + '/' + this.scopeModel.get('id') + '/variables/schools.institute_internship.total_places/now';
    this._widgets.push(new App.View.Widgets.Schools.CounterSimple({
      id_scope: this.scopeModel.get('id'),
      title: 'Total internships',
      school: residence,
      dataModel: dataModelInternships,
      timeMode:'now',
    }));


    var dataModelCompanies = new App.Model.Post({
      var_id:"schools.institute_internship.company_name",
      data:{
        ranges: 'all',
        filters: {
          condition: {'institute_id__eq': residence.properties.id_entity}
        }
      }
    });

    dataModelCompanies.url = App.config.api_url + '/' + this.scopeModel.get('id') + '/variables/schools.institute_internship.company_name/histogram/discrete/now';
    dataModelCompanies.parse = function(e) {
      e = _.filter(e, function(company){ return company.category !== null });
      return {value: e.length}
    }
    this._widgets.push(new App.View.Widgets.Schools.CounterSimple({
      id_scope: this.scopeModel.get('id'),
      title: 'Total companies',
      school: residence,
      dataModel: dataModelCompanies,
      timeMode:'now',
    }));

    this._widgets.push(new App.View.Widgets.Schools.InternshipStatusStacked({
      id_scope: this.scopeModel.get('id'),
      school: residence,
      entity: 'institute_internship',
      timeMode:'now',
    }));

    this._widgets.push(new App.View.Widgets.Schools.InternshipsTable({
      id_scope: this.scopeModel.get('id'),
      school: residence,      
      timeMode:'now',
    }));
    
    this._widgets.push(new App.View.Widgets.Schools.CoursesTable({
      id_scope: this.scopeModel.get('id'),
      school: residence,      
      timeMode:'now',
    }));

    this._widgets.push(new App.View.Widgets.Schools.KPITable({
      id_scope: this.scopeModel.get('id'),
      school: residence,
      timeMode:'now',
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));
  },

  onClose: function() {
    this._mapView.close();
    App.View.Panels.Splitted.prototype.onClose.call(this);    
  }

});
