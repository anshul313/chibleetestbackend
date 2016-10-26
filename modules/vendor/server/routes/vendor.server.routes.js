'use strict';

/**
 * Module dependencies
 */
var loginPolicy = require('../policies/vendor.server.policy'),
  util = require('../../../../config/lib/util.js'),
  vendors = require('../controllers/vendor.server.controller');

module.exports = function(app) {

  app.route('/v2/getvendor').all(util.userAuthenticate)
    .post(vendors.getvendors);

  app.route('/v2/getelasticvendor/:input/:area/:page').all(util.userAuthenticate)
    .get(vendors.getelasticvendor);

  app.route('/v2/addcomment').all(util.userAuthenticate)
    .post(vendors.addcomment);

  app.route('/v2/vendorbyarea/:subcat/:area/:page').all(util.userAuthenticate)
    .get(vendors.vendorByArea);

  app.route('/v2/addvendor').all(util.userAuthenticate)
    .post(vendors.addvendor);

  app.route('/v2/getcomments/:vendorId').all(util.userAuthenticate)
    .get(vendors.getcomments);

  app.route('/v2/getvendorsbyrating').all(util.userAuthenticate)
    .get(vendors.getVendorsByRating);

  app.route('/v2/getelasticsearchbylatlng/:lat/:lon/:page')
    .get(vendors.getelasticsearchbylatlng);

  app.route('/v2/getVendorsByHomeDelivery').all(util.userAuthenticate)
    .post(vendors.getVendorsByHomeDelivery);

  app.route('/v2/addbookmark/:vendorId/:status').all(util.userAuthenticate)
    .get(vendors.addBookMark);

  // app.route('/v2/deletebookmark/:vendorId').all(util.userAuthenticate)
  //   .get(vendors.deleteBookMark);

  app.route('/v2/getbookmark/:page').all(util.userAuthenticate)
    .get(vendors.getBookMark);

  app.route('/v2/getsuggestion/:inp').all(util.userAuthenticate)
    .get(vendors.getsuggestion);

  app.route('/v2/vendorbytag/:cat/:subcat/:area/:tag/:page').all(util.userAuthenticate)
    .get(vendors.vendorByTags);

  app.route('/v2/addnewvendor').all(util.userAuthenticate)
    .post(vendors.addNewVendor);

  app.route('/v2/addcontactcallhistory/:vendorId/:number').all(util.userAuthenticate)
    .get(vendors.addContactHistory);

  app.route('/v2/getcontactcallhistory').all(util.userAuthenticate)
    .get(vendors.getContactHistory);

  app.route('/v2/getaddednewvendor').all(util.userAuthenticate)
    .get(vendors.getAddedNewVendor);

  app.route('/v2/getusercomments').all(util.userAuthenticate)
    .get(vendors.getUserComments);

  app.route('/v2/deletevendor/:vendorId').all(util.userAuthenticate)
    .get(vendors.deleteVendor);

  app.route('/v2/convertexceltojson')
    .get(vendors.convertExcelToJson);

  app.route('/v2/googledatainsert')
    .get(vendors.googleDataInsert);

  app.route('/v2/getbanner')
    .get(vendors.getBanner);

  app.route('/v2/addbanner')
    .post(vendors.addBanner);

  app.route('/v2/temp')
    .get(vendors.temp);

  app.route('/v2/autosearch')
    .get(vendors.autosearch);

  app.route('/v2/datacorrect')
    .get(vendors.dataCorrect);

};
