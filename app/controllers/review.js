var request = require('request');
var mongoose = require("mongoose");
require('../models/user');
require('../models/data');
var users = mongoose.model('users');
var data = mongoose.model('Chibleedata');
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
    .route('/review/:id')
    .post(methods.review);


}

/*===========================================
***  End Services  ***
=============================================*/


/*===========================================================
    *** Login Service  ***
    =============================================================*/
methods.review = function(req, res) {
  req.checkBody('userId', 'userId not Provided').notEmpty();
  req.checkBody('ratings', 'ratings Cannot be empty.').notEmpty();
  req.checkBody('comment', 'comment Cannot be empty').notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    response.error = true;
    response.status = 400;
    response.errors = errors;
    response.userMessage = 'Validation errors';
    return (SendResponse(res));
  } else {
    data.findByIdAndUpdate(req.params.id, {
      $addToSet: {
        comments: {
          userId: req.body.userId,
          ratings: req.body.ratings,
          comment: req.body.comment
        }
      }
    }, function(err, data) {
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
