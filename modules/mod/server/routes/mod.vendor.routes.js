'use strict';

/**
 * Module dependencies
 */
var modPolicy = require('../policies/mod.server.policy'),
    util = require('../../../../config/lib/util.js'),
    mod = require('../controllers/mod.vendor.controller');

module.exports = function(app) {

    app.route('/v2/clean-vendor-list')
        .get(mod.cleanVendorList);
};