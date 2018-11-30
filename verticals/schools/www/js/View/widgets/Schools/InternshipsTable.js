'use strict';

App.View.Widgets.Schools.InternshipsTable =  App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title:__('Internships list'),
      timeMode: 'historic',
      id_category: 'schools',
      exportable: true,
      entity: 'institute_internship',
      dimension: 'double scroll defaultHeight bgWhite',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    // Skip more code if widget is not allowed
    if(!this.hasPermissions()) return;

    var _this = this;

    this.$el.addClass('issuesRanking');    
    var tableModel = new Backbone.Model({
      'css_class':'internshipRanking',
      'csv':false,
      'columns_format': {
        'internship_name':{'title': __('Title'), 'css_class':'textcenter', 'formatFN': function(d) { 
            return d;
          }, 'tooltip': true
        },
        'company_name':{'title': __('Company'), 'css_class':'textcenter', 'formatFN': function(d) { 
            return d;
          }, 'tooltip': true
        },
        'remaining_places':  {'title': __('Places'), 'formatFN': function(d, data) {
          return '<span class="active">' + (data.total_places - data.remaining_places) +
            '</span><b> · </b><span class="availables">' + data.remaining_places + '</span>';
        }, 'css_class':'textcenter'},        
        'duration':  {'title': __('Duration'), 'formatFN': function(d, data) {

          var from = moment.unix(data.internship_from_date/1000);
          var to = moment.unix(data.internship_to_date/1000);

          return moment.duration((to).diff(from)).humanize();
        }, 'css_class':'textcenter'},
      }
    });

    this.collection = new App.Collection.Variables.Ranking([],{
      id_scope: this.options.id_scope,
      data: {
        vars: [
          'schools.' + this.options.entity + '.institute_id',
          'schools.' + this.options.entity + '.internship_name',
          'schools.' + this.options.entity + '.total_places',         
          'schools.' + this.options.entity + '.remaining_places',
          'schools.' + this.options.entity + '.company_name',
          'schools.' + this.options.entity + '.internship_from_date',
          'schools.' + this.options.entity + '.internship_to_date',
          
        ],
        var_order: 'schools.' + this.options.entity + '.institute_id',
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
