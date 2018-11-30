App.View.AfterLogin = Backbone.View.extend({
  _template: _.template(''),
  className: 'login',
  
  initialize: function(options) {
    var _this = this;
    var params = window.location.search.replace('?','').split('&');
    var objectParams = {};
    
    this.$el.append(App.widgetLoading());
    this._headerView = options.headerView;    

    _.each(params, function(param) {
      objectParams[param.split('=')[0]] = param.split('=')[1];
    });
    if(objectParams.token && objectParams.expires) {
      App.auth.oauthLogin(objectParams.token, objectParams.expires, function() {
        App.mv().start(function () {
          App.router.navigate('', {trigger: true});
          _this._headerView.render();
        });
      });
    }
    
  },

  onClose: function () {
    this.stopListening();
  },

  render: function () {
    this.$el.html(this._template());
    return this;
  }
})