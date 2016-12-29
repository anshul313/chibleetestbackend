'use strict';

/**
 * Module dependencies
 */
var modPolicy = require('../policies/mod.server.policy'),
  util = require('../../../../config/lib/util.js'),
  mod = require('../controllers/mod.vendor.controller');

module.exports = function(app) {

  app.route('/v2/clean-vendor-list')
    .post(mod.cleanVendorList);

  app.route('/v2/vendor-list')
    .get(mod.vendorList);

  app.route('/v2/vendor-details-by-id')
    .get(mod.vendorDetailsById);

  app.route('/v2/confirm-vendor')
    .post(mod.confirmVendor);

  app.route('/v2/clean-vendor-details-by-id')
    .get(mod.cleanVendorDetailsById);

  app.route('/v2/clean-vendor-details-update-by-id')
    .post(mod.cleanVendorDetailsUpdateById);
};
