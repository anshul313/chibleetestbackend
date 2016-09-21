'use strict';

/**
 * Module dependencies
 */
var loginPolicy = require('../policies/login.server.policy'),
  util = require('../../../../config/lib/util.js'),
  login = require('../controllers/login.server.controller');

module.exports = function(app) {

  app.route('/v2/login')
    .post(login.login);

  app.route('/v2/category')
    .get(login.category);

  app.route('/v2/subcategory/:category')
    .get(login.subcategory);

  app.route('/v2/listarea/:subcat/:area/:page')
    .get(login.listarea);

  app.route('/v2/areas')
    .get(login.areas);
  // Finish by binding the article middleware
  app.route('/v2/googlelocationapi')
    .post(login.googlelocationapi);

  app.route('/v2/search/:lat/:lon/:input/:page')
    .get(login.searchbyinput);

  app.route('/v2/addIndex')
    .post(login.addIndex);

};
