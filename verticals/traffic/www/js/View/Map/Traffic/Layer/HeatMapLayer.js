'use strict';

App.View.Map.Layer.Traffic.HeatMapLayer = Backbone.View.extend({
  _sql_template: _.template( $("#maps-traffic_sql_template").html() ),
  _sql_template_incidences: _.template( $("#maps-traffic_incidences_sql_template").html() ),

  _C: 1,

  stops: function(c, relative) {
    if (!c) {
      if (c !== 0) {
        c = 1;
      }
    }
    if (!relative) {
      return [
        'case',
          [
            'any',
            [
              '<=',
              ['to-number', ['get','variable']],
              0
            ],
            [
              'to-boolean',
              ['get','is_old']
            ]
          ],
          '#C2C2C2',
          [
            '<',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(25, c)
          ],
          '#58BC8F',
          [
            '<',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(50, c)
          ],
          '#ACB35D',
          [
            '<',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(75, c)
          ],
          '#FFAA2A',
          [
            '<',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(100, c)
          ],
          '#FF7519',
          [
            '>=',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(100, c)
          ],
          '#FF2500',
          'transparent'
      ];
    } else {
      return this.stopsRelative(c)
    }
  },

  stopsRelative: function(c) {
    return [
      'case',
      [
        'any',
        [
          '<=',
          ['to-number', ['get','intensity']],
          0
        ],
        [
          'to-boolean',
          ['get','is_old']
        ]
      ],
      '#C2C2C2',
      ['<',['to-number', ['get','variable']], 0],
      [
        'case',
        ['<', ['^', ['*',['to-number', ['get','variable']],-1], c], 0.25],
        '#51AC9A',
        ['<', ['^', ['*',['to-number', ['get','variable']],-1], c], 0.5],
        '#4A9DA4',
        ['<', ['^', ['*',['to-number', ['get','variable']],-1], c], 0.75],
        '#428DAF',
        ['>=', ['^', ['*',['to-number', ['get','variable']],-1], c], 0.75],
        '#336C7D',
        'transparent'
      ],
      ['>',['to-number', ['get','variable']], 0],
      [
        'case',
        ['<', ['^', ['to-number', ['get','variable']], c], 0.25],
        '#ACB35D',
        ['<', ['^', ['to-number', ['get','variable']], c], 0.5],
        '#FFAA2A',
        ['<', ['^', ['to-number', ['get','variable']], c], 0.75],
        '#FF7519',
        ['>=', ['^', ['to-number', ['get','variable']], c], 0.75],
        '#FF2500',
        'transparent'
      ],
      '#58BC8F'
    ];
  },

  stopsServiceLevels: function() {

    return [
      'case',
        [
          'to-boolean',
          ['get','is_old']
        ],
        '#C2C2C2',
        [
          '<=',
          ['to-number', ['get','service_level']],
          0
        ],
        '#58BC8F',
        [
          '<=',
          ['to-number', ['get','service_level']],
          1
        ],
        '#FFAA2A',
        [
          '<=',
          ['to-number', ['get','service_level']],
          2
        ],
        '#FF7519',
        [
          '<=',
          ['to-number', ['get','service_level']],
          3
        ],
        '#FF2500',
        'transparent'
    ];
  },

  stopsServiceLevelsImages: function() {
    return [
      'case',
        [
          'to-boolean',
          ['get','is_old']
        ],
        'via-level0',
        [
          '<=',
          ['to-number', ['get','service_level']],
          0
        ],
        'via-level1',
        [
          '<=',
          ['to-number', ['get','service_level']],
          1
        ],
        'via-level3',
        [
          '<=',
          ['to-number', ['get','service_level']],
          2
        ],
        'via-level4',
        [
          '<=',
          ['to-number', ['get','service_level']],
          3
        ],
        'via-level5',
        'via-level0'
    ];
  },

  stopsImages: function(c, relative) {
    if (!c) {
      if (c !== 0) {
        c = 1;
      }
    }

    if (!relative) {
      return [
        'case',
          [
            'any',
            [
              '<=',
              ['to-number', ['get','variable']],
              0
            ],
            [
              'to-boolean',
              ['get','is_old']
            ]
          ],
          'via-level0',
          [
            '<',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(25, c)
          ],
          'via-level1',
          [
            '<',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(50, c)
          ],
          'via-level2',
          [
            '<',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(75, c)
          ],
          'via-level3',
          [
            '<',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(100, c)
          ],
          'via-level4',
          [
            '>=',
            ['to-number', ['get','variable']],
            App.Utils.Traffic.calculatedValue(100, c)
          ],
          'via-level5',
          'transparent'

      ];
    } else {
      return this.stopsRelativeImages(c)
    }
  },

  stopsRelativeImages: function(c) {
    return [
      'case',
      [
        'any',
        [
          '<=',
          ['to-number', ['get','intensity']],
          0
        ],
        [
          'to-boolean',
          ['get','is_old']
        ]
      ],
      'via-level0',
      ['<',['to-number', ['get','variable']], 0],
      [
        'case',
        ['<', ['^', ['*',['to-number', ['get','variable']],-1], c], 0.25],
        'via-variacion3',
        ['<', ['^', ['*',['to-number', ['get','variable']],-1], c], 0.5],
        'via-variacion2',
        ['<', ['^', ['*',['to-number', ['get','variable']],-1], c], 0.75],
        'via-variacion1',
        ['>=', ['^', ['*',['to-number', ['get','variable']],-1], c], 0.75],
        'via-variacion0',
        'transparent',
      ],
      ['>',['to-number', ['get','variable']], 0],
      [
        'case',
        ['<', ['^', ['to-number', ['get','variable']], c], 0.25],
        'via-level2',
        ['<', ['^', ['to-number', ['get','variable']], c], 0.5],
        'via-level3',
        ['<', ['^', ['to-number', ['get','variable']], c], 0.75],
        'via-level4',
        ['>=', ['^', ['to-number', ['get','variable']], c], 0.75],
        'via-level5',
        'transparent'
      ],
      'via-level1'
    ];
  },

  initialize: function(options, payload, map) {
    this.map = map;
    App.map = map;
    this.variable = 'intensity_ratio';

    var sql_template = this._sql_template({
      scope: App.currentScope,
      variable: 'intensity_ratio',
      status: App.Static.Collection.Traffic.IntensityLevel.pluck('id'),
      relative: false,
      serviceLevel: false,
      c: 1,
    });

    var sql_incidences_template = this._sql_template_incidences({
      scope: App.currentScope,
      incidences: App.Static.Collection.Traffic.Incidences.pluck('id'),
    });

    this.model = new App.Model.TilesModel({
      url: 'https://' + App.Utils.getCartoAccount('traffic') + '.carto.com/api/v1/map',
      params: {
        layers:[ {
          id: 'cartoLayer',
          options:{
            sql: sql_template
          }
        }],
      }
    });

    this.modelIncidence = new App.Model.TilesModel({
      url: 'https://' + App.Utils.getCartoAccount('traffic') + '.carto.com/api/v1/map',
      params: {
        layers:[ {
          id: 'incidencesCartoLayer',
          options:{
            sql: sql_incidences_template
          }
        }],
      }
    });

    this.layer = new App.View.Map.Layer.MapboxSQLLayer({
      source: {
        id: 'cartoSource',
        model: this.model,
      },
      legend: {},
      layers: [
        {
          'id': 'issue_point_blur',
          'type': 'circle',
          'source': 'cartoSource',
          'maxzoom': 13,
          'source-layer': 'cartoLayer',
          'paint': {
            'circle-color': this.stops(),
            'circle-radius': {
              'stops': [
                [0, 2],
                [11, 6],
                [12, 20],
                [18, 40]
              ]
            },
            'circle-blur': {
              'stops': [
                [0, 4],
                [10, 1.5],
                [11, 0.85],
                [12, 2],
                [18, 0.4]
              ]
            }
          },
        },
        {
          'id': 'issue_point_symbol',
          'type': 'symbol',
          'source': 'cartoSource',
          'source-layer': 'cartoLayer',
          'minzoom': 14,
          'layout': {
            'icon-image': this.stopsImages(),
            'icon-allow-overlap': true
          }
        },
        {
          'id': 'issue_point',
          'type': 'circle',
          'source': 'cartoSource',
          'source-layer': 'cartoLayer',
          'minzoom': 11.2,
          'maxzoom': 14,
          'paint': {
            'circle-color': this.stops(),
            'circle-stroke-color': '#fff',
            'circle-stroke-width':{
              'stops': [
                [13, 0],
                [14, 1],
              ]
            },
            'circle-radius': {
              'stops': [
                [11, 2],
                [15, 8]
              ]
            }
          }
        }
      ],
      map: map
    })
    .setHoverable(true)
    .on('click','issue_point',this._clickPoint)
    .setPopup('with-extended-title', __('Monitored Road'), function(e) {

        var level = App.Static.Collection.Traffic.ServiceLevel.get(e.features[0].properties.service_level);
        e.features[0].properties.address = JSON.parse(e.features[0].properties.address);
        if (!e.features[0].properties.address.streetAddress ||
          e.features[0].properties.address.streetAddress === 'None') {
          e.features[0].properties.address.streetAddress = e.features[0].properties.id_entity
        }

        e.features[0].properties.serviceLevelName = level.get('name');
        e.features[0].properties.fromNow = moment.utc(e.features[0].properties.updated_at).fromNow();
        var template = [ {
          output: App.View.Map.RowsTemplate.EXTENDED_TITLE,
          properties: [{
            value: 'address#streetAddress',
          },{
            value: 'fromNow'
          }]
        }, {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          classes: (this.variable === 'intensity_ratio')?'large':'',
          properties: [{
            label: 'Intensidad',
            value: 'intensity',
            units: 'veh/h'
          }]
        }, {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          classes: (this.variable === 'load')?'large':'',
          properties: [{
            label: 'Carga',
            value: 'load',
            units: '%'
          }]
        }, {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          classes: (this.variable === 'occupancy')?'large':'',
          properties: [{
            label: 'Ocupación',
            value: 'occupancy',
            units: '%'
          }]
        }, {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          classes: (this.variable === 'intensity_relative_ratio')?'large':'',
          properties: [{
            label: 'Intensidad media',
            nbf: App.nbf,
            value: 'intensity_avg',
            units: 'veh/h'
          }]
        }, {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          classes: (this.variable === 'load_relative_ratio')?'large':'',
          properties: [{
            label: 'Carga media',
            nbf: App.nbf,
            value: 'load_avg',
            units: '%'
          }]
        }, {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          classes: (this.variable === 'occupancy_relative_ratio')?'large':'',
          properties: [{
            label: 'Ocupación media',
            nbf: App.nbf,
            value: 'occupancy_avg',
            units: '%'
          }]
        }, {
          output: App.View.Map.RowsTemplate.BASIC_ROW,
          classes: ((this.variable === 'service_level')?'large':'') + ' colored ' + level.get('cid'),
          properties: [{
            label: 'Nivel de servicio',
            value: 'serviceLevelName',
          }]
        }];

        return template;
      }.bind(this)
    );

    this.layerIncidence = new App.View.Map.Layer.MapboxSQLLayer({
      source: {
        id: 'incidencesCartoSource',
        model: this.modelIncidence,
      },
      legend: {},
      layers: [
        {
          'id': 'incidence_circle',
          'type': 'symbol',
          'source': 'incidencesCartoSource',
          'source-layer': 'incidencesCartoLayer',
          'layout': {
            'icon-size': {
              'stops': [
                [13, 0.6],
                [14, 0.7],
                [15, 0.9],
              ]
            },
            'icon-image': {
              'property': 'kind',
              'type': 'categorical',
              'default': 'transparent',
              'stops': [
                [1, 'construction'],
                [2, 'accident'],
                [3, 'hazard'],
                [4, 'event'],
                [5, 'misc'],
              ]
            },
            'icon-allow-overlap': true
          },
          'paint': {
            'icon-opacity': {
              'property': 'kind',
              'type': 'categorical',
              'default': 1,
              'stops': [
                [5, 0.8],
              ]
            }
          }
        }
      ],
      map: map
    })
    .setHoverable(true)
    .setPopup('with-extended-title', __('Incidences'), function(e) {
      e.features[0].properties.typeText = App.Static.Collection.Traffic.Incidences.get(e.features[0].properties.kind).get('name');
      e.features[0].properties.fromNow = moment.utc(e.features[0].properties.updated_at).fromNow();
      e.features[0].properties.start_date = moment(e.features[0].properties.start_date).format('DD/MM/YYYY HH:mm');
      e.features[0].properties.end_date = moment(e.features[0].properties.end_date).format('DD/MM/YYYY HH:mm');
      var template = [{
        output: App.View.Map.RowsTemplate.EXTENDED_TITLE,
        properties: [{
          value: 'typeText',
        },{
          value: 'fromNow'
        }]
      },{
        output: App.View.Map.RowsTemplate.BASIC_ROW,
        properties: [{
          label: 'Descripción',
          value: 'description',
        }]
      },{
        output: App.View.Map.RowsTemplate.BASIC_ROW,
        properties: [{
          label: 'Desde',
          value: 'start_date',
        }]
      },{
        output: App.View.Map.RowsTemplate.BASIC_ROW,
        properties: [{
          label: 'Hasta',
          value: 'end_date',
        }]
      }];

      return template;
    }.bind(this));
  },

  onClose: function() {
    clearInterval(this.realTime);
  },

  updateSQL: function(filter) {
    filter = filter.toJSON();

    this.variable = filter.variable
    if (filter.variable === 'intensity') {
      filter.variable = 'intensity_ratio';
    }
    var incidences = [];

    _.each(filter.incidences, function(incidence) {
      incidences.push(App.Static.Collection.Traffic.Incidences.get(incidence).get('id'));
    });
    filter.relative = this.variable.includes('_relative_');
    filter.serviceLevel = this.variable === 'service_level';
    var sql_template = this._sql_template(filter);
    var sql_incidences_template = this._sql_template_incidences(filter);
    this.map._map.setPaintProperty(
      'issue_point',
      'circle-color',
      (this.variable === 'service_level') ?
        this.stopsServiceLevels() :
        this.stops(filter.c, this.variable.includes('_relative_'))
    );

    this.map._map.setPaintProperty(
      'issue_point_blur',
      'circle-color',
      (this.variable === 'service_level') ?
        this.stopsServiceLevels() :
        this.stops(filter.c, this.variable.includes('_relative_'))
    );

    this.map._map.setLayoutProperty(
      'issue_point_symbol',
      'icon-image',
      (this.variable === 'service_level') ?
        this.stopsServiceLevelsImages() :
        this.stopsImages(filter.c, this.variable.includes('_relative_'))
    );

    this.layer._updateSQLData(sql_template);
    this.layerIncidence._updateSQLData(sql_incidences_template, 'incidencesCartoLayer');
  },

  _clickPoint: function(e) {

  },
});
