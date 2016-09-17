var request = require('request');
var mongoose = require("mongoose");
require('../models/user');
var users = mongoose.model('users');
var async = require('async');
var sns = require('../libs/SNS.js');
var os = require('os');
var fs = require('fs');
var AWS = require('aws-sdk');
var SNS = require('sns-mobile');
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
    .route('/launch')
    .post(methods.launch);


}

/*===========================================
***  End Services  ***
=============================================*/


/*===========================================================
    *** Launch Service  ***
    =============================================================*/

methods.launch = function(req, res) {
  req.checkBody('deviceID', 'deviceID is required.').notEmpty();
  req.checkBody('appVersion', 'appVersion is required.').notEmpty();
  req.checkBody('platform', 'platform is required').notEmpty();
  req.checkBody('pushToken', 'pushToken is required.').notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    response.error = true;
    response.status = 400;
    response.errors = errors;
    response.userMessage = 'Validation errors';
    return (SendResponse(res));
  } else {
    users.findOne({
      deviceID: req.body.deviceID
    }, function(err, data) {
      if (err) {
        response.error = true;
        response.status = 400;
        response.errors = err;
        response.userMessage = "Server internal error 1";
        return SendResponse(res);
      } else if (data) {
        users.update({
            deviceID: req.body.deviceID
          }, {
            "$set": {
              deviceID: req.body.deviceID,
              appVersion: req.body.appVersion,
              platform: req.body.platform,
              pushToken: req.body.pushToken
            }
          }, {
            multi: true
          },
          function(err, result) {
            if (err) {
              response.error = true;
              response.status = 400;
              response.errors = err;
              response.userMessage = "Server internal error 2";
              return SendResponse(res);
            } else {
              response.error = false;
              response.status = 200;
              response.userMessage = "Device registered successfuly";
              response.data = data;
              return SendResponse(res);
            }

          });
      } else {
        var pushToken = req.body.pushToken;
        var platform = req.body.platform;
        var location = req.body.location;
        sns.getARN(pushToken, platform, function(err, endpointArn) {
          if (err) {
            response.error = true;
            response.status = 400;
            response.userMessage = "Error in SNS";
            response.errors = err;
            return SendResponse(res);
          }
          var user_device = new users({
            deviceID: req.body.deviceID,
            appVersion: req.body.appVersion,
            platform: platform,
            pushToken: pushToken,
            ARN: endpointArn,
            location: location,
            Model: req.body.Model,
            SDK: req.body.SDK,
            sim: req.body.sim
          });
          user_device.save(function(err, data) {
            if (err) {
              response.error = true;
              response.errors = err;
              response.status = 500;
              response.userMessage = "Server internal error 3";
              return SendResponse(res);
            } else {
              response.userMessage =
                "Device registred successfuly";
              response.status = 200;
              return SendResponse(res);
            }
          });
        });
      }
    });
  }
}


/*-----  End of tracking by id ------*/
