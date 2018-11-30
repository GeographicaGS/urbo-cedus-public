var deps = {};

var src = 'src/verticals/theme-cedus/';
var srcJS = src + 'js/';
var public = 'verticals/theme-cedus/';

deps.templateFolder = [];

deps.JS = [
  srcJS + 'Router.js',  
  srcJS + 'AfterLoginView.js',
  srcJS + 'LoginOverride.js'
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { 
    srcFolder: src + 'public/img', 
    dstFolder: public + 'img', 
    onDebugIgnore: false 
  }
]

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
