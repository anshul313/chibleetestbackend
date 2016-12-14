'use strict';

/**
 * Module dependencies
 */
var modPolicy = require('../policies/mod.server.policy'),
  util = require('../../../../config/lib/util.js'),
  mod = require('../controllers/mod.server.controller');

module.exports = function(app) {

  app.route('/v2/modlogin')
    .post(mod.modLogin);

  app.route('/v2/modregister')
    .post(mod.modRegister);

  app.route('/v2/modlogout')
    .post(mod.modLogout);

};
