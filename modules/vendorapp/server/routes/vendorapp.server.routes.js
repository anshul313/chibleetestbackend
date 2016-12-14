'use strict';

/**
 * Module dependencies
 */
var loginPolicy = require('../policies/vendorapp.server.policy'),
  util = require('../../../../config/lib/util.js'),
  vendorapp = require('../controllers/vendorapp.server.controller');

module.exports = function(app) {

  app.route('/v2/launch')
    .post(vendorapp.launch);

  app.route('/v2/login')
    .put(vendorapp.confirmOTP);

  app.route('/v2/locationhistory')
    .post(vendorapp.locationHistory);

  app.route('/v2/vendortouserchat')
    .post(vendorapp.vendortouserchat);

  app.route('/v2/usertovendorchat')
    .post(vendorapp.usertovendorchat);

  app.route('/v2/getchathistory')
    .get(vendorapp.getchathistory);

  app.route('/v2/test')
    .post(vendorapp.test);

};
