'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
//
// /**
//  * Article Schema
//  */
// var CompaignSchema = new Schema({
//   referral: {
//     type: String,
//     trim: true
//   },
//
//   source: {
//     type: String,
//     trim: true
//   },
//
//   deviceId: {
//     type: String,
//     trim: true,
//     required: true
//   },
//
//   saveTime: {
//     type: Date,
//     Default: Date.now()
//   }
// });

// mongoose.model('compaign', CompaignSchema);

var userSchema = new Schema({
  name: {
    type: String,
    default: ''
  },
  authToken: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  sim: {
    type: String,
    default: ''
  },
  pushToken: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    required: true
  },
  model: {
    type: String,
    default: ''
  },
  deviceId: {
    type: String,
    default: ''
  },
  signUpDate: {
    type: Date,
    default: Date.now()
  },
  lastLogin: {
    type: Date,
    default: Date.now()
  },
  imageUrl: {
    type: String,
    default: ''
  },
  appVersion: {
    type: String,
    default: ''
  },
  profileType: {
    type: String,
    default: ''
  },
  lastLocation: {
    type: [Number],
    index: '2dsphere'
  }
});

mongoose.model('chibleeusers', userSchema);
