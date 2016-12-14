'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;


var vendorSchema = new Schema({
  deviceID: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: Number,
    default: 0
  },
  paytmNumber: {
    type: Number,
    default: 0
  },
  mobikwikNumber: {
    type: Number,
    default: 0
  },
  authToken: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: ''
  },
  gcmId: {
    type: String,
    default: ''
  },
  androidSdk: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  subCategory: {
    type: String,
    default: ''
  },
  isStationary: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  isWalletInterested: {
    type: Boolean,
    default: false
  },
  area: {
    type: String,
    default: ''
  },
  shopNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  landmark: {
    type: String,
    default: ''
  },
  fromTiming: {
    type: String,
    default: ''
  },
  toTiming: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  isHomeDelivery: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  registerTime: {
    type: Number,
    default: 0
  },
  OTP: {
    type: Number,
    default: 0
  },
  appVersion: {
    type: String,
    default: ''
  },
  speciality: {
    type: String,
    default: ''
  },
  offDays: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: false
  },
  platform: {
    type: String,
    default: ''
  },
  multiTime: {
    type: Boolean
  },
  remarks: {
    type: String,
    default: ''
  }
});


var locationSchema = new Schema({
  vendorID: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    default: 0
  },
  longitude: {
    type: Number,
    default: 0
  },
  registerTime: {
    type: Number,
    default: 0
  },
  isOpen: {
    type: Number,
    default: 0
  }
});

var chatSchema = new Schema({
  vendorID: {
    type: String,
    default: ''
  },
  userID: {
    type: String,
    default: ''
  },
  vendorName: {
    type: String,
    default: ''
  },
  userGcmId: {
    type: String,
    default: ''
  },
  vendorGcmId: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: ''
  },
  messageText: {
    type: String,
    default: ''
  },
  messageStatus: {
    type: String,
    default: ''
  },
  uuid: {
    type: String,
    default: ''
  },
  insertionDate: {
    type: Number,
    default: 0
  }
});


module.exports = mongoose.model('vendorDetail', vendorSchema);
module.exports = mongoose.model('Location', locationSchema);
module.exports = mongoose.model('Chat', chatSchema);
