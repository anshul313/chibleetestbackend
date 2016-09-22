'use strict';

/**
 * Module dependencies
 */
var loginPolicy = require('../policies/vendor.server.policy'),
  util = require('../../../../config/lib/util.js'),
  vendors = require('../controllers/vendor.server.controller');

module.exports = function(app) {

  app.route('/v2/addvendor')
    .post(vendors.addvendor);
  app.route('/v2/getvendor')
    .post(vendors.getvendor);
};
