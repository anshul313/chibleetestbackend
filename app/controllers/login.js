var request = require('request');
var mongoose = require("mongoose");
require('../models/user');
var users = mongoose.model('users');
var user = mongoose.model('chibleeusers');
var Profile = mongoose.model('profile');
var async = require('async');
var os = require('os');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var config = require('config');
var crypto = require('crypto');


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
    .route('/login')
    .post(methods.login);


}

/*===========================================
***  End Services  ***
=============================================*/


/*===========================================================
    *** Login Service  ***
    =============================================================*/

// methods.login = function(req, res) {
//   req.checkBody('profileType', 'Profile Type is Required').notEmpty();
//   req.checkBody('uid', 'uid is required.').notEmpty();
//   req.checkBody('name', 'name is required').notEmpty();
//   req.checkBody('deviceID', 'deviceID is required.').notEmpty();
//   var errors = req.validationErrors(true);
//   if (errors) {
//     response.error = true;
//     response.status = 400;
//     response.errors = errors;
//     response.userMessage = 'Validation errors';
//     return (SendResponse(res));
//   } else {
//     users.findOne({
//       deviceID: req.body.deviceID
//     }, function(err, data) {
//       if (err) {
//         response.error = true;
//         response.status = 400;
//         response.errors = err;
//         response.userMessage = "Internal Server Error 1";
//         return SendResponse(res);
//       } else if (data) {
//         var prof = new Profile({
//           name: req.body.name,
//           image: req.body.image,
//           username: req.body.username,
//           profileType: req.body.profileType,
//           uid: req.body.uid,
//         });
//         users.update({
//           deviceID: req.body.deviceID
//         }, {
//           '$set': {
//             profile: prof
//           }
//         }, function(err, result) {
//           if (err) {
//             response.error = true;
//             response.status = 400;
//             response.errors = err;
//             response.userMessage = "Server internal error 2";
//             return SendResponse(res);
//           } else {
//             response.error = false;
//             response.status = 200;
//             response.userMessage = "User Logged In";
//             response.data = data;
//             return SendResponse(res);
//           }
//         });
//       } else {
//         response.error = true;
//         response.errors = "";
//         response.status = 500;
//         response.userMessage = "Unknown Device";
//         return SendResponse(res);
//       }
//
//     });
//   }
// }


methods.login = function(req, res) {
  req.checkBody('email', 'email is required').notEmpty();
  req.checkBody('deviceId', 'deviceID is required.').notEmpty();
  req.checkBody('platform', 'platform is required').notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    response.error = true;
    response.status = 400;
    response.errors = errors;
    response.userMessage = 'Validation errors';
    return (SendResponse(res));
  } else {
    user.findOne({
      deviceId: req.body.deviceId,
      email: req.body.email
    }, function(err, data) {
      if (err) {
        response.error = true;
        response.status = 400;
        response.errors = err;
        response.userMessage = "Internal Server Error";
        return SendResponse(res);
      } else if (data) {
        response.error = false;
        response.status = 200;
        response.userMessage = "User Logged In";
        response.data = data.authToken;
        return SendResponse(res);
      } else {
        var authToken = crypto.createHmac('sha256', req.body.deviceId).update(
          req.body.email).digest('hex');
        var newuser = new user({
          name: req.body.name,
          authToken: authToken,
          username: req.body.username,
          email: req.body.email,
          sim: req.body.sim,
          pushToken: req.body.pushToken,
          platform: req.body.platform,
          model: req.body.model,
          deviceId: req.body.deviceId,
          imageUrl: req.body.imageUrl,
          appVersion: req.body.appVersion,
          profileType: req.body.profileType
        });
        newuser.save(newuser, function(err, result) {
          if (err) {
            response.error = true;
            response.status = 400;
            response.errors = err;
            response.userMessage =
              "Server internal error during saving user ";
            return SendResponse(res);
          } else {
            response.error = false;
            response.status = 200;
            response.userMessage = "User Logged In";
            response.data = authToken;
            return SendResponse(res);
          }
        });
      }
    });
  }
}
