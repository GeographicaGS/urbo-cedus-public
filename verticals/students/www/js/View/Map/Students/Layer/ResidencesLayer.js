'use strict';

App.View.Map.Layer.Students.ResidencesLayer = Backbone.View.extend({
  _sql_template: _.template( $("#Students-maps-students_sql_template").html() ),
  _sql_pois_template: _.template( $("#Students-maps-students_pois_sql_template").html() ),

  events: {
    'click .residencesbutton .button': '_clickPoint'
  },   

  initialize: function(options, payload, map) {
    this.map = map;
    
    _.bindAll(this, '_clickPoint');
    _.bindAll(this, '_onBack');

    this.listenTo(this.map.mapChanges,'change:clickedResidence',this._onBack);

    var _this = this;

    var sql_template = this._sql_template({
      scope: App.currentScope,
      variable: '10',
    });
    var sql_pois_template = this._sql_pois_template({
      scope: App.currentScope,
      coord: [],
    });

    // Diffentent properties to show
    var defaultProperties = {
      abstract: {
        label: 'Abstract',
        parseValue: function(value) {
          return value.length > 100
            ? value.slice(0, 100).concat('...| exactly')
            : value.concat('| exactly');
        }
      },
      available_services: {
        label: 'Available Services',
        parseValue: function(values) {
          return values.join(', ').concat('| exactly');
        }
      },
      contacts: {
        label: 'Contacts',
        parseValue: function(values) {
          if(typeof values === 'string') {
            values = JSON.parse(values);
          }
          return _.map(values, function(value) {
            return value.Type + ': ' + value.String;
          }).join('<br/>').concat('| exactly');
        }
      },
      capacities: {
        label: 'Capacities',
      },
      description: {
        label: 'Description',
        parseValue: function(value) {
          return value.length > 100
            ? value.slice(0, 100).concat('...| exactly')
            : value.concat('| exactly');
        }
      },
      media_resources: {
        label: 'Media Resources',
        parseValue: function(values) {
          values = typeof values === 'string'
            ? JSON.parse(values)
            : values;

          values = _.filter(values, function(value) {
            return value.type !== 'image';
          });

          if(values.length) {
            return _.map(values, function(value) {
              var currentHtml = '<a href="%uri%" target="_blank">%name%</a>';
  
              currentHtml = currentHtml.replace('%uri%', value.uri);
              currentHtml = currentHtml.replace('%name%', value.name);
              return currentHtml;
            }).join('<br/>').concat('| exactly');
          } else {
            return false;
          }
        }
      },
      price_infos: {
        label: 'Price Info'
      },
      opening_time: {
        label: 'Opening Time'
      },
      order_by: {
        label: 'Order by'
      },
      organizer: {
        label: 'Organizer'
      },
      owner: {
        label: 'Owner'
      },
      scopes: {
        label: 'Scopes',
        parseValue: function(values) {
          return values.join(', ').concat('| exactly');
        }
      },
      tags: {
        label: 'Tags',
        parseValue: function(values) {
          return values.join(', ').concat('| exactly');
        }
      },
      typology: {
        label: 'Typology'
      },
    };

    this.model = new App.Model.TilesModel({
      url: 'https://' + App.Utils.getCartoAccount('students') + '.carto.com/api/v1/map',
      params: {
        layers:[ {
          id: 'cartoLayer',
          options:{
            sql: sql_template
          }
        }],
      }
    });

    this.poisModel = new App.Model.TilesModel({
      url: 'https://' + App.Utils.getCartoAccount('students') + '.carto.com/api/v1/map',
      params: {
        layers:[ {
          id: 'cartoLayer',
          options:{
            sql: sql_pois_template
          }
        }],
      }
    });

    this.turfModel = new App.Model.FunctionModel({
      function: turf.circle,
      params: [[0,0],1]
    });

    this.turfLayer = new App.View.Map.Layer.MapboxGeoJSONLayer({
      source: {
        id: 'turfSource',        
        model: this.turfModel,
      },
      legend: {},
      layers: [
        {
          'id': 'area',
          'type': 'line',
          'source': 'turfSource',
          'paint': {
            'line-color': '#F7A034',
            'line-dasharray': [3,2],
            'line-width': 2,  
          },
          'filter': ['all', false]
        },
        {
          'id': 'areaFill',
          'type': 'fill',
          'source': 'turfSource',
          'paint': {
            'fill-color': '#F7A034',
            'fill-opacity': 0.1,
          },
          'filter': ['all', false]
        }
      ],
      map: map,
    });

    this.layer = new App.View.Map.Layer.MapboxSQLLayer({
      source: {
        id: 'cartoSource',
        model: this.model,
      },
      legend: {},
      layers: [
        {
          'id': 'residences',
          'type': 'symbol',
          'source': 'cartoSource',
          'source-layer': 'cartoLayer',
          'layout': {
            'icon-image': 'residence',
            'icon-allow-overlap': true
          },
          'filter': ['all', true]
        }
      ],
      map: map
    })
    .setHoverable(true)
    .setPopup('with-extended-title', __('Residence'), function(e, popup) {

        _this.clicked = {features: [App.Utils.toDeepJSON(e.features[0])]};
        _this.popup = popup;
        _this.clicked.features[0].properties.coord = JSON.parse(e.features[0].properties.coord).coordinates;
        e.features[0].properties.fromNow = moment(e.features[0].properties.dateModified).fromNow();

        // Title
        var template = [ {
          output: App.View.Map.RowsTemplate.EXTENDED_TITLE,
          properties: [{
            value: 'name',
          },{
            value: '| exactly'
          }]
        }];

        // All Properties
        var _templateProperties = _this._makeTemplateProperties(
          e.features[0].properties, 
          defaultProperties, 
          App.View.Map.RowsTemplate.BASIC_ROW
        );

        _.each(_templateProperties, function(_currentTemplate) {
          template.push(_currentTemplate);
        });

        // Action Button
        template.push({
          output: App.View.Map.RowsTemplate.ACTION_BUTTON,
          classes: 'residencesbutton',
          properties: [{
            value: 'id_entity'
          },{
            value: 'Select residence | exactly | translate'
          }]
        });

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
          'id': 'pois',
          'type': 'symbol',
          'source': 'cartoPoisSource',
          'source-layer': 'cartoPoisLayer',
          'layout': {
            'icon-image': {
              'property': 'category',
              'type': 'categorical',
              'default': 'transparent',
              'stops': [
                ["107", 'historic-shops'],
                ["311", 'museo'],
                ["371", 'protected-areas'],
                ["430", 'itinerary'],
                ["435", 'hostel'],
              ]
            },
            'icon-size': 0.8,
            'icon-allow-overlap': true
          }
        }
      ],
      map: map
    })
    .setPopup('with-extended-title', '', function(e, popup) {
      e.features[0].properties.categoryName =
        App.Static.Collection.Students.POIsTypes.get(e.features[0].properties.category).get('name');

      // Title
      var template = [ {
        output: App.View.Map.RowsTemplate.EXTENDED_TITLE,
        properties: [{
          value: 'categoryName'
        },{
          value: 'name',
        }]
      }];

      // All Properties
      var _templateProperties = _this._makeTemplateProperties(
        e.features[0].properties, 
        defaultProperties, 
        App.View.Map.RowsTemplate.BASIC_ROW
      );

      _.each(_templateProperties, function(_currentTemplate) {
        template.push(_currentTemplate);
      });

      return template;
    });
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
    var kilometers = this.map.variableSelector.options.filterModel.get('variable');
    
    
    this.map._map.setFilter("area", ["all", true]);
    this.map._map.setFilter("areaFill", ["all", true]);
    this.map._map.setFilter("residences", ["==", ["get", "id_entity"], id_entity]);
    this.map._map.setFilter("pois", ["all", true]);
    
    this.map.mapChanges.set('clickedResidence',this.clicked);
    
    var sql_pois_template = this._sql_pois_template({scope: App.currentScope, coord: coord, variable: kilometers});
    this.turfLayer.updateData({params:[coord,kilometers,{units:'kilometers'}]});
    this.poisLayer._updateSQLData(sql_pois_template, 'cartoPoisLayer');

    var the_geom = this.map.variableSelector.options.filterModel.get('the_geom') || {};
    the_geom.ST_Intersects = this.turfModel.get('response').geometry;
    this.map.variableSelector.options.filterModel.set('the_geom',the_geom);
  },

  _onBack: function(change) {
    if (!change.get('clickedResidence')) {
      this.map._map.setFilter("area", ["all", false]);
      this.map._map.setFilter("areaFill", ["all", false]);
      this.map._map.setFilter("residences", ["all", true]);
      this.map._map.setFilter("pois", ["all", false]);
      this.clicked = null;
      // Clear filter to show all 'interest point' when back from detail
      this.map.variableSelector.options.filterModel.set('the_geom', null);
    }
  },

  _makeTemplateProperties: function(data, properties, template) {
    return _.reduce(Object.keys(properties), function(parseProperties, property) {
        if(data.hasOwnProperty(property) && data[property] !== '[object Object]' && data[property] !== 'null') {
          var currentValue = typeof properties[property].parseValue === 'function'
            ? properties[property].parseValue(data[property])
            : property;

          if(currentValue !== false) {
            parseProperties.push({
              output: template,
              properties: [{
                label: __(properties[property].label),
                value: typeof properties[property].parseValue === 'function'
                  ? properties[property].parseValue(data[property])
                  : property,
              }]
            });
          }
        }
        return parseProperties;
    },[]);
  },
});
