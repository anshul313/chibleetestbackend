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
  app.route('/v2/getelasticvendor/:input/:area/:page')
    .get(vendors.getelasticvendor);
  app.route('/v2/addcomment').all(util.userAuthenticate)
    .post(vendors.addcomment);
  app.route('/v2/getcomments/:vendorId')
    .get(vendors.getcomments);
  app.route('/v2/getvendorsbyrating')
    .get(vendors.getVendorsByRating);
  app.route('/v2/getelasticsearchbylatlng/:input/:lat/:lon/:page')
    .get(vendors.getelasticsearchbylatlng);
};
