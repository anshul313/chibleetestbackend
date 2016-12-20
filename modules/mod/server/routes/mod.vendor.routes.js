'use strict';

/**
 * Module dependencies
 */
var modPolicy = require('../policies/mod.server.policy'),
  util = require('../../../../config/lib/util.js'),
  mod = require('../controllers/mod.vendor.controller');

module.exports = function(app) {

<<<<<<< HEAD
  app.route('/v2/clean-vendor-list')
    .get(mod.cleanVendorList);

  app.route('/v2/confirm-vendor')
    .post(mod.confirmVendor);

};
=======
    app.route('/v2/clean-vendor-list')
        .get(mod.cleanVendorList);

    app.route('/v2/vendor-list')
        .get(mod.vendorList);

    app.route('/v2/vendor-details-by-id')
        .get(mod.vendorDetailsById);
};
>>>>>>> 8e8e4264092854cfd7d719d99bd405814def467d
