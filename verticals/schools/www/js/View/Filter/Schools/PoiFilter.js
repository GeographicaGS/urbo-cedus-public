'use strict';

App.View.Filter.Schools.PoiMapFilter = App.View.Filter.Base.extend({
  _template: _.template( $('#Schools-filter-filter_pois_template').html()),

  events: {
    'click h3' : '_toggleFilter',
    // 'click .statusesTypes li[data-id]': '_onClickType',
    'click .toggler': '_toggleMultiselector',
  },

  initialize: function(options) {
    App.View.Filter.Base.prototype.initialize.call(this,options);
    // this.listenTo(App.ctx, 'change:bbox', this.asynchronousData);
    // this.listenTo(this.model, 'change:the_geom', this.asynchronousData);
  },

  render: function(){
    this.$el.html(this._template({
      m: this.model.toJSON(),
      status: App.Static.Collection.Schools.POIsTypes.toJSON(),
      className: 'issues'
    }));
    // this.asynchronousData();

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

  asynchronousData: function() {
    this.asyncModel = new App.Collection.Histogram([],{
      scope: App.currentScope,
      variable: 'students.pointofinterest.category',
      type: 'discrete',
      mode: 'now',
      data : {
        ranges: 'all',
        filters: {
          the_geom: {
          }
        }
      }
    });

    if (App.ctx.get('bbox_status')) {
      this.asyncModel.options.data.filters.the_geom['&&'] = App.ctx.getBBOX();
    }

    if (this.model.get('the_geom') && this.model.get('the_geom').ST_Intersects) {
      this.asyncModel.options.data.filters.the_geom['ST_Intersects'] = this.model.get('the_geom').ST_Intersects;
    }
    this.asyncModel.fetch({
      success: function(ranges) {
        $('.statusesTypes li[data-id] .total').html('-');
        ranges.each(function(range) {
          var status = App.Static.Collection.Schools.POIsTypes.get(range.get('name')[0].toString());
          $('.statusesTypes li[data-id="' + status.get('id') + '"] .total').html(range.get('value'))
        });
      }
    });
    var _this = this;
  }
});
