/***/
/* 
 * jqCanvo package.js
 * 
 * this package file is available on "foonyah" architecture 
 * see more information - http://liberty-technology.biz/
 */

var name = 'jqCanvo', pkg = {

  explain: {
    sammary: 'jQuery oriented canvas plugin',
  },

  condition: {
    version: '0.3.0',
    status: 'on development'
  },

  css_files: [],
  server_modules: [],
  browser_modules: ['jquery.jqcanvo', 'lib/jqcanvo.util', 'lib/jqcanvo.shapes',
    'index'],
  dependencies: false,

  Default: {}

};

module.exports = (function() {
  return pkg;
})();
