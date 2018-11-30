'use strict';

App.View.Widgets.Schools.CoursesTable =  App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title:__('Courses list'),
      timeMode: 'historic',
      id_category: 'schools',
      exportable: true,
      entity: 'course',      
      dimension: 'scroll defaultHeight bgWhite',
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
        'name':{'title': __('Title'), 'css_class':'textcenter', 'formatFN': function(d) { 
            return d;
          }, 'tooltip': true
        },
        'duration':  {'title': __('Duration'), 'formatFN': function(d, data) {
          var from = moment.unix(data.from_date/1000);
          var to = moment.unix(data.to_date/1000);

          return moment.duration((to).diff(from)).humanize();
        }, 'css_class':'textcenter'},
      }
    });

    this.collection = new App.Collection.Variables.Ranking([],{
      id_scope: this.options.id_scope,
      data: {
        vars: [
          'schools.' + this.options.entity + '.institute_id',
          'schools.' + this.options.entity + '.name',
          'schools.' + this.options.entity + '.from_date',
          'schools.' + this.options.entity + '.to_date',
          
        ],
        var_order: 'schools.' + this.options.entity + '.name',
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
