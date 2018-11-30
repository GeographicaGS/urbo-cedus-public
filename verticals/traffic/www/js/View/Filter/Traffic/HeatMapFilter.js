'use strict';

App.View.Filter.Traffic.HeatMapFilter = App.View.Filter.Base.extend({
  _template: _.template( $('#filter-filter_heatmap_template').html()),

  events: {
    'click h3' : '_toggleFilter',
    'click .statusesTypes li[data-id]': '_onClickType',
    'click .incidencesTypes li[data-id]': '_onClickIncidence',
    'click .levelsTypes li[data-id]': '_onClickServiceLevels',
    'click .toggler': '_toggleMultiselector',
  },

  initialize: function(options) {
    App.View.Filter.Base.prototype.initialize.call(this,options);
    this.listenTo(App.ctx, 'change:bbox', this.asynchronousData);
    this.listenTo(this.model, 'change:variable', this.asynchronousData);
    this.listenTo(this.model, 'change:c', this.asynchronousData);
  },

  render: function(){
    this.$el.html(this._template({
      m: this.model.toJSON(),
      status: App.Static.Collection.Traffic.IntensityLevel.toJSON(),
      incidences: App.Static.Collection.Traffic.Incidences.toJSON(),
      levels: App.Static.Collection.Traffic.ServiceLevel.toJSON(),
      className: 'issues'
    }));

    this._rangeForC = new App.View.Filter.SimpleSlider({
      model: this.model,
      property: 'c',
      includeOutOfRange: true,
      domainLabels: ['0.1','2'],
      min: 0.1,
      max: 2,
      step: 0.1,
      domain:[0, this.model.get('c')]
    });

    this.$('.firstresponse').append(this._rangeForC.render().$el);    

    this.asynchronousData();

    return this;
  },

  _toggleFilter:function(){
    this.$el.toggleClass('compact');
  },

  _onClickType: function(e){
    var $e = $(e.currentTarget);
    
      if ($e.attr('selected')) {
        this.$('.statusesTypes li[data-id="all"]').addClass('disabled');
        this.$('.statusesTypes li[data-id="all"]').attr('selected', false);
        $e.removeAttr('selected');
      } else
        $e.attr('selected',true);
  
      $e.toggleClass('disabled');
      $e.find('span').toggleClass('disabled');

    var ids = _.map(this.$('.statusesTypes li[data-id][selected]'),function(c){
      return $(c).attr('data-id');
    });
    this.model.set('status',ids);
  },
  
  _onClickIncidence: function(e){
    var $e = $(e.currentTarget);
    
      if ($e.attr('selected')) {
        this.$('.incidencesTypes li[data-id="all"]').addClass('disabled');
        this.$('.incidencesTypes li[data-id="all"]').attr('selected', false);
        $e.removeAttr('selected');
      } else
        $e.attr('selected',true);
  
      $e.toggleClass('disabled');
      $e.find('span').toggleClass('disabled');

    var ids = _.map(this.$('.incidencesTypes li[data-id][selected]'),function(c){
      return $(c).attr('data-id');
    });
    this.model.set('incidences',ids);
  },

  _onClickServiceLevels: function(e){
    var $e = $(e.currentTarget);
    
      if ($e.attr('selected')) {
        this.$('.levelsTypes li[data-id="all"]').addClass('disabled');
        this.$('.levelsTypes li[data-id="all"]').attr('selected', false);
        $e.removeAttr('selected');
      } else
        $e.attr('selected',true);
  
      $e.toggleClass('disabled');
      $e.find('span').toggleClass('disabled');

    var ids = _.map(this.$('.levelsTypes li[data-id][selected]'),function(c){
      return $(c).attr('data-id');
    });
    this.model.set('levels',ids);
  },

  asynchronousData: function(e) {

    this.asyncModel = new App.Collection.Histogram([],{
      scope: App.currentScope,
      variable: 'traffic.trafficflowobserved.' + this.model.get('variable'),
      type: 'continuous',
      mode: 'now',
      data : {
        ranges: !e || !e.get('variable').includes('_relative_') ? [
          { '<': App.Utils.Traffic.calculatedValue(25, this.model.get('c'))},
          { '>=': App.Utils.Traffic.calculatedValue(25, this.model.get('c')), '<': App.Utils.Traffic.calculatedValue(50, this.model.get('c')) },
          { '>=': App.Utils.Traffic.calculatedValue(50, this.model.get('c')), '<': App.Utils.Traffic.calculatedValue(75, this.model.get('c')) },
          { '>=': App.Utils.Traffic.calculatedValue(75, this.model.get('c')), '<': App.Utils.Traffic.calculatedValue(100, this.model.get('c')) },
          { '>=': App.Utils.Traffic.calculatedValue(100, this.model.get('c')) },
        ] : [
          { '<': 0.2},
          { '>=': 0.2, '<': 0.4 },
          { '>=': 0.4, '<': 0.6 },
          { '>=': 0.6, '<': 0.8 },
          { '>=': 0.8 },
        ],
        filters: {}
      }
    });

    if(e && e.get('variable') === 'service_level') {
      this.asyncModel.options.type = 'discrete';
      this.asyncModel.options.data.ranges = [0,1,2,3];
      $('#statusesTypes').addClass('hidden');
      $('#relativeTypes').addClass('hidden');
      $('#levelsTypes').removeClass('hidden');
      $('#levelsTypes h4.notoggler').text(App.Static.Collection.Traffic.VariablesForSelector.get(e.get('variable')).get('name'));
    } else if (e && e.get('variable').includes('_relative_')){
      $('#levelsTypes').addClass('hidden');
      $('#statusesTypes').addClass('hidden');
      $('#relativeTypes').removeClass('hidden');
      $('#relativeTypes h4.notoggler').text(App.Static.Collection.Traffic.VariablesForSelector.get(e.get('variable')).get('name'));
    } else {
      $('#levelsTypes').addClass('hidden');
      $('#relativeTypes').addClass('hidden');
      $('#statusesTypes').removeClass('hidden');

      if (e && e.get('variable')) {
        $('#statusesTypes h4.notoggler').text(App.Static.Collection.Traffic.VariablesForSelector.get(e.get('variable')).get('name'));
      }
    }

    if (e && (e.get('variable') === 'service_level')) {
      $('.slider-range').slider('disable');
    } else {
      $('.slider-range').slider('enable')
    }

    if (App.ctx.get('bbox_status')) {
      this.asyncModel.options.data.filters = {"bbox": App.ctx.getBBOX()};
    }
    this.asyncModel.fetch({
      success: function(ranges) {
        var staticCollection = App.Static.Collection.Traffic.IntensityLevel;
        var divClass = '.statusesTypes';
        
        
        if (ranges.options.variable.includes('_relative_')) {
          staticCollection = App.Static.Collection.Traffic.Averages;
        } else if (ranges.options.variable.includes('service_level')) {
          staticCollection = App.Static.Collection.Traffic.ServiceLevel;
          divClass = '.levelsTypes';
        }

        ranges.each(function(range) {
          var status = staticCollection.get(range.get('name').toString());
            if (status) {
              $(divClass + ' li[data-id="' + status.get('id') + '"] .label').text(status.get('name'))
              $(divClass + ' li[data-id="' + status.get('id') + '"] .total').html(range.get('value'))
            }
        });
      }
    });
    
    this._getIncidencesData(e)
  },

  _getIncidencesData: function(e) {
    this.asyncModel = new App.Collection.Histogram([],{
      scope: App.currentScope,
      variable: 'traffic.incidence.kind',
      type: 'discrete',
      mode: 'now',
      data : {
        ranges: 'all',
        filters: {
          condition: {
            '"TimeInstant"__gt': moment.utc().subtract('15 minutes')
          }
        }
      }
    });

    if (App.ctx.get('bbox_status')) {
      this.asyncModel.options.data.filters = {"bbox": App.ctx.getBBOX()};
    }
    this.asyncModel.fetch({
      success: function(ranges) {
        ranges.each(function(range) {
          var status = App.Static.Collection.Traffic.Incidences.get(range.get('name'));
          $('.incidencesTypes li[data-id="' + status.get('id') + '"] .label').text(status.get('name'))
          $('.incidencesTypes li[data-id="' + status.get('id') + '"] .total').html(range.get('value'))
        });
      }
    });
  }
  
});
