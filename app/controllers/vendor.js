var request = require('request');
var mongoose = require("mongoose");
require('../models/vendor');
var users = mongoose.model('users');
var vendor = mongoose.model('vendor');
var Profile = mongoose.model('profile');
var async = require('async');
var os = require('os');
var fs = require('fs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
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
    .route('/vendor')
    .post(methods.vendor);


}

/*===========================================
***  End Services  ***
=============================================*/


/*===========================================================
    *** Login Service  ***
    =============================================================*/
methods.vendor = function(req, res) {
  // // req.checkBody('userId', 'userId not Provided').notEmpty();
  // // req.checkBody('ratings', 'ratings Cannot be empty.').notEmpty();
  // // req.checkBody('comment', 'comment Cannot be empty').notEmpty();
  // // var errors = req.validationErrors(true);
  // // if (errors) {
  // //     response.error = true;
  // //     response.status = 400;
  // //     response.errors = errors;
  // //     response.userMessage = 'Validation errors';
  // //     return (SendResponse(res));
  // // }else{
  //     fs.rename(req.files[0].path,  + '/uploads/' + req.files[0].originalname, function(err){
  //  if(err){
  //     return res.render('upload', {title : 'Upload Image', message : { type: 'danger', messages : [ 'Failed uploading image. 1x001']}});
  //  } else {
  //     console.log(req.files);
  //    var fileBuffer = fs.readFileSync('./uploads/' + req.files[0].originalname);
  //    var s3_param = {
  //        Bucket: 'chiblee-app',
  //        Key: req.files.image,
  //        Expires: 60,
  //        ContentType: req.files.mimetype,
  //        ACL: 'public-read',
  //        Body: fileBuffer
  //     };
  //     s3.putObject(s3_param, function(err, data){
  //        if(err){
  //           console.log(err);
  //        } else {
  //         var return_data = {
  //            signed_request: data,
  //            url: 'https://poshbellies.s3.amazonaws.com/'+req.files.image

  //         };
  //         console.log('return data - ////////// --------------');
  //         console.log(return_data);
  //         return res.render('upload', {data : return_data, title : 'Upload Image : success', message : { type: 'success', messages : [ 'Uploaded Image']}});

  //        }
  //     });
  // // }
  // }
}
