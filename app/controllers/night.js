var request = require('request');
var mongoose = require("mongoose");
require('../models/data');
var data = mongoose.model('Chibleedata');
var async = require('async');
var os = require('os');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var config = require('config');

var response = {
  error: false,
  status: 200,
  userMessage: '',
  errors: null,
  data: null,
};

var NullResponseValue = function() {
  response = {
    error: false,
    status: 200,
    userMessage: '',
    errors: null,
    data: null,
  };
  return true;
};

var SendResponse = function(res) {
  res.status(response.status);
  res.send(response);
  NullResponseValue();
};


/*===========================================
***   Services  ***
=============================================*/
var methods = {};
module.exports.controller = function(router) {

  router
    .route('/night/:subcat/:lat/:lon/:page')
    .get(methods.night);


}

/*===========================================
***  End Services  ***
=============================================*/



/*===========================================================
    *** Listing Service  ***
=============================================================*/

methods.night = function(req, res) {
  var subcat = req.params.subcat;
  var limit = 10;
  if (req.params.page == 1) {
    var skip = 0;
  } else {
    var skip = limit * parseInt(req.params.page);
  }
  var maxDistance = 5000;

  var coords = [];
  coords[0] = req.params.lon;
  coords[1] = req.params.lat;
  data.find({
    'Sub-Cat': subcat,
    'night': true,
    location: {
      $near: coords,
      $maxDistance: maxDistance
    }
  }).skip(skip).limit(limit).exec(function(err, locations) {
    if (err) {
      response.error = true;
      response.status = 400;
      response.errors = err;
      response.userMessage = "Internal Server Error";
      return SendResponse(res);
    } else {
      response.error = false;
      response.status = 200;
      response.userMessage = "";
      response.data = locations;
      return SendResponse(res);
    }
  });
}


/*-----  End of tracking by id ------*/
