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
    .route('/nightarea/:subcat/:area/:page')
    .get(methods.nightarea);


}

/*===========================================
***  End Services  ***
=============================================*/



/*===========================================================
    *** Listing Service  ***
=============================================================*/

methods.nightarea = function(req, res) {
  subcat = req.params.subcat;
  area = req.params.area;
  var limit = 10;
  var skip = limit * parseInt(req.params.page);
  data.find({
    'Sub-Cat': subcat,
    'night': true,
    Area: new RegExp('^' + area + '$', "i")
  }).skip(skip).limit(limit).exec(function(err, docs) {
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
      response.data = docs;
      return SendResponse(res);
    }
  });
}


/*-----  End of tracking by id ------*/
