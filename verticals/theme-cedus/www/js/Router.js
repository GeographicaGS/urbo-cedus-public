App.Router.prototype.afterLogin = function() {
  App.showView(new App.View.AfterLogin({'headerView':App.header}));
};

const afterLoginRoutes = {
  'oauth/login' : 'afterLogin',
};

App.Router.prototype.routes = Object.assign(afterLoginRoutes, App.Router.prototype.routes);
