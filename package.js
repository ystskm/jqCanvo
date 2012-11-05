/***/
/* jqCanvo package.js */
/* this package file is available on "foonyah" architecture */

var name = 'jqCanvo', pkg = {

  explain: {
    sammary: 'jQuery oriented canvas plugin',
//    url: '[plugin-url]'
  },

  condition: {
    version: '1.0.0',
    status: 'on development'
  },

  css_files: [],

  server_modules:[],
  
  browser_modules: ['jquery.jqcanvo', 'jqcanvo.util', 'jqcanvo.shapes'],

  dependencies: false,

  Default: {}

};

module.exports = function() {
  return pkg;
}();
