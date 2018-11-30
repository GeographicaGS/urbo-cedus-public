'use strict';

App.View.Widgets.Schools.KPITable =  App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title:__('KPI list'),
      timeMode: 'historic',
      id_category: 'schools',
      exportable: true,
      entity: 'kpi',
      dimension: 'double scroll defaultHeight bgWhite',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    // Skip more code if widget is not allowed
    if(!this.hasPermissions()) return;

    var _this = this;

    this.$el.addClass('issuesRanking');    
    var tableModel = new Backbone.Model({
      'css_class':'issuesRanking',
      'csv':false,
      'columns_format': {
        'product': {
            'title': __('Course'), 
            'css_class':'textcenter',
            'formatFN': function(d, data) {
                return data.product.name;
            }, 
            'tooltip': true
        },
        'category': {
            'title': __('Category'), 
            'css_class':'textcenter', 
            'formatFN': function(d) { 
                return d;
            },
            'tooltip': true
        },
        'name': {
            'title': __('Name'),
            'css_class':'textcenter',
            'formatFN': function(d) { 
                return d;
            },
            'tooltip': true
        },
        'kpi_value': {
            'title': __('Value'),
            'css_class':'textcenter',
            'formatFN': function(d) { 
                return d;
            }, 
            'tooltip': true
        },
      }
    });

    this.collection = new App.Collection.Variables.Ranking([],{
      id_scope: this.options.id_scope,
      data: {
        vars: [
          'schools.' + this.options.entity + '.product',
          'schools.' + this.options.entity + '.category',
          'schools.' + this.options.entity + '.name',
          'schools.' + this.options.entity + '.kpi_value',
        ],
        var_order: 'schools.' + this.options.entity + '.product',
        filters: {
          condition: {
            institute_id__eq: this.options.school.properties.id_entity,
          }
        }        
      },
      mode: 'now'
    });  
    
    this.subviews.push(new App.View.Widgets.TableNewCSV({
      listenContext: true,
      model: tableModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },
});
