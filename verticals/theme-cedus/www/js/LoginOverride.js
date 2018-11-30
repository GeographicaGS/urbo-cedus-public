var oldRender = App.View.Login.prototype.render;
var oldInit   = App.View.Login.prototype.initialize;
var events = App.View.Login.prototype.events;
events['click .cedus-idm-login-btn'] = 'loginIDM';

// Override Login
App.View.Login = App.View.Login.extend({
  initialize: function(options) {
    oldInit.call(this, options)
  },
  events: events,
  render() {
    oldRender.call(this);
    this.$el.find(".content").append('<input type="submit" class="cedus-idm-login-btn" value="'+ __('Iniciar sesión con IDM') +'">');
    return this;
  },
  loginIDM(e)  {
    e.stopPropagation();
    this.$el.append(App.widgetLoading());    
    window.location.href = App.config.api_url+'/auth/idm/auth?cb=' + window.location.origin + '/oauth/login';
    return false;
  }
});

// Override App to change behaviour when not logged;
App._standardIni = function() {
  this.mode = 'standard';
  $('body').attr('mode',this.mode);
  this.auth = new App.Auth();
  this.router = new App.Router();
  //this._user = new App.User();

  this.header = new App.View.HeaderView({
    el: $('header')
  });

  this.footer = new App.View.FooterView({
    el: $('footer')
  }).render();

  this._navigationBarModel = new App.Model.NavigationBar();
  this._navigationBar = new App.View.NavigationBar({
    el: $('nav.navbar'),
    model: this._navigationBarModel
  }).render();

  var _this = this;
  this.auth.start(function(st){
    if (!st){
      var searchParams = window.location.search || '';
      Backbone.history.start({pushState: true, silent:true, root: '/' + App.lang + '/' });
      
      if (!searchParams) {
        _this.router.navigate('login' + searchParams, {trigger: false});
        Backbone.history.loadUrl('login');
      } else {
        _this.router.navigate('oauth/login' + searchParams, {trigger: false});
        Backbone.history.loadUrl('oauth/login');
      }
    }else{
      _this._metadata.start(function(){
        if (!_this.started){
          _this.started = true;
          Backbone.history.start({pushState: true, root: '/' + App.lang +'/'});
        }
      });
    }
  });
}
