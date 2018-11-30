'use strict';

App.View.Map.Layer.Schools.SchoolLayer = Backbone.View.extend({
  _sql_template: _.template( $("#Schools-maps-schools_sql_template").html() ),
  _sql_template_companies: _.template( $("#Schools-maps-companies_sql_template").html() ),
  _sql_pois_template: _.template( $("#Schools-maps-schools_pois_sql_template").html() ),
  _sql_lines_template: _.template( $("#Schools-maps-schools_companies_lines_sql_template").html() ),

  events: {
    'click .residencesbutton .button': '_clickPoint'
  },   

  initialize: function(options, payload, map) {
    this.map = map;
    
    _.bindAll(this, '_clickPoint');
    _.bindAll(this, '_onBack');

    this.listenTo(this.map.mapChanges,'change:clickedSchool',this._onBack);

    var _this = this;

    var sql_template = this._sql_template({
      scope: App.currentScope
    });
    var sql_companies_template = this._sql_template_companies({
      scope: App.currentScope
    });
    var sql_pois_template = this._sql_pois_template({
      scope: App.currentScope,
      institute_id: -1
    });
    var sql_lines_template = this._sql_lines_template({
      scope: App.currentScope,
      institute_id: -1
    });

    this.model = new App.Model.TilesModel({
      url: 'https://' + App.Utils.getCartoAccount('schools') + '.carto.com/api/v1/map',
      params: {
        layers:[ {
          id: 'cartoLayer',
          options:{
            sql: sql_template
          }
        }],
      }
    });

    this.companiesModel = new App.Model.TilesModel({
      url: 'https://' + App.Utils.getCartoAccount('schools') + '.carto.com/api/v1/map',
      params: {
        layers:[ {
          id: 'cartoLayer',
          options:{
            sql: sql_companies_template
          }
        }],
      }
    });

    this.poisModel = new App.Model.TilesModel({
      url: 'https://' + App.Utils.getCartoAccount('schools') + '.carto.com/api/v1/map',
      params: {
        layers:[ {
          id: 'cartoLayer',
          options:{
            sql: sql_pois_template
          }
        }],
      }
    });

    this.linesModel = new App.Model.TilesModel({
      url: 'https://' + App.Utils.getCartoAccount('schools') + '.carto.com/api/v1/map',
      params: {
        layers:[ {
          id: 'cartoLinesLayer',
          options:{
            sql: sql_lines_template
          }
        }],
      }
    });

    this.linesLayer = new App.View.Map.Layer.MapboxSQLLayer({
      source: {
        id: 'cartoLinesSource',        
        model: this.linesModel,
      },
      legend: {},
      layers: [
        {
          'id': 'lines-active',
          'type': 'line',        
          'source': 'cartoLinesSource',
          'source-layer': 'cartoLinesLayer',
          'paint': {
            'line-color': '#58BC8F'
          },
          'filter': ['all', false]          
        }
      ],
      map: map
    });

    this.companiesLayer = new App.View.Map.Layer.MapboxSQLLayer({
      source: {
        id: 'companiesSource',        
        model: this.companiesModel,
      },
      legend: {},
      layers: [
        {
          'id': 'companies',
          'type': 'symbol',        
          'source': 'companiesSource',
          'source-layer': 'cartoLayer',
          'layout': {
            'icon-image': ['case', ['>', ['to-number', ['get', 'i_remaining_places']], 0], 'company-available', 'company-all-active'],
            'icon-allow-overlap': true
          },
          'filter': ['all', true]
        }
      ],
      map: map
    })
    .setHoverable(true)
    .setPopup('with-extended-title', __('Company'), 
      [
        {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          properties: [{
            label: __('Name'),
            value: 'company_name',
          }]
        },
        {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          properties: [{
            label: __('Internships number'),
            value: 'internships_number',
          }]
        },
        {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          properties: [{
            label: __('Internships places'),
            value: 'internships_places',
          }]
        }      
      ]
    );

    this.layer = new App.View.Map.Layer.MapboxSQLLayer({
      source: {
        id: 'cartoSource',        
        model: this.model,
      },
      legend: {},
      layers: [
        {
          'id': 'school-internship',
          'type': 'circle',        
          'source': 'cartoSource',
          'source-layer': 'cartoLayer',
          'paint': {
            'circle-radius': ['min',[
              '+',
              ['to-number', ['get', 'total_places']],
              15
            ],30],
            'circle-color': '#58BC8F',
            'circle-opacity': 0.5,
            'circle-stroke-color': "#58BC8F",
            'circle-stroke-width': 1,
          },
          'filter': ['>', ['to-number', ['get', 'total_places']], 0]
        },
        {
          'id': 'schools',
          'type': 'symbol',        
          'source': 'cartoSource',
          'source-layer': 'cartoLayer',
          'layout': {
            'icon-image': 'school',
            'icon-allow-overlap': true
          },
          'filter': ['all', true]
        }
      ],
      map: map
    })
    .setHoverable(true)
    .setPopup('with-extended-title', __('Institute'), function(e, popup) {
        _this.clicked = {features: e.features};
        _this.popup = popup;

        var template = [ {
          output: App.View.Map.RowsTemplate.EXTENDED_TITLE,
          properties: [{
            value: 'name',
          },{
            value: '| exactly'
          }]
        }, {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          properties: [{
            value: 'remaining_places',
            label: 'Available internships'
          }]
        }, {
          output: App.View.Map.RowsTemplate.ACTION_BUTTON,
          classes: 'residencesbutton',
          properties: [{
            value: 'id_entity'
          },{
            value: 'View profile | exactly | translate'
          }]
        }];

        return template;
      }
    );

    this.poisLayer = new App.View.Map.Layer.MapboxSQLLayer({
      source: {
        id: 'cartoPoisSource',        
        model: this.poisModel,
      },
      legend: {},
      layers: [
        {
          'id': 'pois-active',
          'type': 'circle',        
          'source': 'cartoPoisSource',
          'source-layer': 'cartoPoisLayer',
          'paint': {
            'circle-color': '#ED7B51',
            'circle-opacity': 0.4,
            'circle-radius': 
              ['+',
                ['-',
                  ['to-number', ['get','total_places']],
                  ['to-number', ['get','remaining_places']]
                ],
              14],
          },
          'filter': ['all', false]
        },
        {
          'id': 'pois-remaining',
          'type': 'circle',        
          'source': 'cartoPoisSource',
          'source-layer': 'cartoPoisLayer',
          'paint': {
            'circle-color': 'transparent',
            'circle-stroke-color': '#58BC8F',
            'circle-radius': 
              ['+',
                ['to-number', ['get','remaining_places']],
              14],
            'circle-stroke-width': 2
          },
          'filter': ['all', false]
        },
        {
          'id': 'pois',
          'type': 'circle',        
          'source': 'cartoPoisSource',
          'source-layer': 'cartoPoisLayer',
          'paint': {
            'circle-color': '#EEEEEE',
            'circle-radius': 10,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 2

          },
          'filter': ['all', false]
        },
        {
          'id': 'internship-value',
          'type': 'symbol',        
          'source': 'cartoPoisSource',
          'source-layer': 'cartoPoisLayer',
          'layout': {
            'text-field': ['to-string', ['get', 'total_places']],
            'text-size': 12
          },
          'filter': ['all', false]
        }
      ],
      map: map
    })
    .setHoverable(true)
    .setPopup('with-extended-title', __('Company'),
      [
        {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          properties: [{
            label: __('Name'),
            value: 'company_name',
          }]
        },
        {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          properties: [{
            label: __('Remaining places'),
            value: 'remaining_places',
          }]
        },
        {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          properties: [{
            label: __('Total places'),
            value: 'total_places',
          }]
        }
      ]
    );
  },

  onClose: function() {
  },

  updateSQL: function(filter) {
    filter = filter.toJSON();
    this.variable = filter.variable;
    
    if (this.clicked) {
      var kilometers = this.variable;
      var coord = this.clicked.features[0].properties.coord;
      
      var sql_pois_template = this._sql_pois_template({scope: App.currentScope, coord: coord, variable: kilometers});
      this.turfLayer.updateData({params:[coord,kilometers,{units:'kilometers'}]});
      this.poisLayer._updateSQLData(sql_pois_template, 'cartoPoisLayer');

      var the_geom = Object.assign({},this.map.variableSelector.options.filterModel.get('the_geom')) || {};
      the_geom.ST_Intersects = this.turfModel.get('response').geometry;
      this.map.variableSelector.options.filterModel.set('the_geom',the_geom);
    }
  },

  _clickPoint: function(e) {
    this.popup.remove();    
    var residenceId = parseInt(e.currentTarget.getAttribute('data-entity-id'));
    var coord = this.clicked.features[0].properties.coord;
    var id_entity = this.clicked.features[0].properties.id_entity;
    
    
    this.map._map.setFilter("schools", ["==", ["get", "id_entity"], id_entity]);
    this.map._map.setFilter("companies", ["all", false]);
    this.map._map.setFilter("school-internship", ["all", false]);
    this.map._map.setFilter("pois", ["all", true]);
    this.map._map.setFilter("pois-active", ["all", true]);
    this.map._map.setFilter("lines-active", ["all", true]);
    this.map._map.setFilter("pois-remaining", ["all", true]);
    this.map._map.setFilter("internship-value", ["all", true]);
    
    this.map.mapChanges.set('clickedSchool',this.clicked);
    
    var sql_pois_template = this._sql_pois_template({scope: App.currentScope, institute_id: id_entity});
    var sql_lines_template = this._sql_lines_template({scope: App.currentScope, institute_id: id_entity});
    this.poisLayer._updateSQLData(sql_pois_template, 'cartoPoisLayer');
    this.linesLayer._updateSQLData(sql_lines_template, 'cartoLinesLayer');

    setTimeout(function() {
      var emptyFeatureCollection = {
        "type": "FeatureCollection",
        "features": []
      };
      _.each(this.map._map.querySourceFeatures('cartoLinesSource', {sourceLayer: 'cartoLinesLayer'}), function(feature) {
        emptyFeatureCollection.features.push(feature);
      });

      if (emptyFeatureCollection.features.length) {
        var bounds = turf.bbox(emptyFeatureCollection);
        this.map._map.fitBounds(turf.bbox(emptyFeatureCollection),{
          padding: 10,
          offset: [10, 10],
        });
      }
    }.bind(this), 600)
  },

  _onBack: function(change) {
    if (!change.get('clickedSchool')) {
      this.map._map.setFilter("schools", ["all", true]);
      this.map._map.setFilter("companies", ["all", true]);
      this.map._map.setFilter("pois", ["all", false]);
      this.map._map.setFilter("pois-active", ["all", false]);
      this.map._map.setFilter("lines-active", ["all", false]);
      this.map._map.setFilter("pois-remaining", ["all", false]);
      this.map._map.setFilter("internship-value", ["all", false]);
      this.map._map.setFilter("school-internship", ['>', ['to-number', ['get', 'total_places']], 0]);
      this.clicked = null;
    }
  }
});
