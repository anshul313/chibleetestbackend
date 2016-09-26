'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var commentSchema = new Schema({
  commentText: {
    type: String
  },
  commentRating: {
    type: Number
  },
  commentUserId: {
    type: Schema.ObjectId
  },
  vendorId: {
    type: Schema.ObjectId
  }
});

var vendorSchema = new Schema({
  name: {
    type: String
  },
  contact: {
    type: String
  },
  category: {
    type: String
  },
  subCategory: {
    type: String
  },
  address: {
    type: String
  },
  area: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  openingTiming: {
    type: String
  },
  closingTiming: {
    type: String
  },
  image: {
    type: String
  },
  saveTime: {
    type: Date,
    default: Date.now()
  },
  multiTime: {
    type: Boolean
  },
  others: {
    type: String
  },
  tags: {
    type: [String]
  },
  coords: {
    type: [Number],
    index: '2dsphere'
  },
  homeDelivery: {
    type: Boolean,
    default: false
  }
}, {
  strict: false
});

module.exports = mongoose.model('cleanvendor', vendorSchema);
module.exports = mongoose.model('vendorcomments', commentSchema);
