var request = require('request');
var mongoose = require("mongoose");
require('../models/report');
var report = mongoose.model('report');
var Profile = mongoose.model('profile');
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
    .route('/report/:id')
    .post(methods.report);


}

/*===========================================
***  End Services  ***
=============================================*/


/*===========================================================
    *** Login Service  ***
    =============================================================*/
methods.report = function(req, res) {
  req.checkBody('userId', 'userId not Provided').notEmpty();
  req.checkBody('problem', 'ratings Cannot be empty.').notEmpty();

  var errors = req.validationErrors(true);
  if (errors) {
    response.error = true;
    response.status = 400;
    response.errors = errors;
    response.userMessage = 'Validation errors';
    return (SendResponse(res));
  } else {

    var repor = new report({
      userId: req.body.userId,
      vendorId: req.params.id,
      problem: req.body.problem
    });
    repor.save(function(err, data) {
      if (err) {
        response.error = true;
        response.status = 400;
        response.errors = err;
        response.userMessage = "Internal Server Error 1";
        return SendResponse(res);
      } else {
        response.error = false;
        response.status = 200;
        response.errors = "";
        response.userMessage = "";
        response.data = data;
        return SendResponse(res);
      }
    });
  }
}
