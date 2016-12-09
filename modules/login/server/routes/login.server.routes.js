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

  app.route('/v2/loginnewuser')
    .post(login.loginnewuser);

  app.route('/v2/loginweb')
    .post(login.loginweb);

  app.route('/v2/category').all(util.userAuthenticate)
    .get(login.category);

  app.route('/v2/subcategory/:category').all(util.userAuthenticate)
    .get(login.subcategory);

  app.route('/v2/areas').all(util.userAuthenticate)
    .get(login.areas);
  // Finish by binding the article middleware
  app.route('/v2/googlelocationapi').all(util.userAuthenticate)
    .post(login.googlelocationapi);

  app.route('/v2/search/:area/:input/:page').all(util.userAuthenticate)
    .get(login.searchbyarea);

  app.route('/v2/getuserdetails').all(util.userAuthenticate)
    .get(login.getUserDetails);

  app.route('/v2/updateuserdetails').all(util.userAuthenticate)
    .post(login.updateUserDetails);

  app.route('/v2/geoaddress')
    .post(login.geoAddress);

  app.route('/v2/geolatlng')
    .post(login.geoLatLng);

  app.route('/v2/test')
    .get(login.test);

  // app.route('/v2/temp')
  //   .get(login.temp);

  //
  // app.route('/v2/addIndex')
  //   .post(login.addIndex);

};
