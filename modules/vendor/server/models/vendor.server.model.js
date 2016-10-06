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
  },
  commentUserName: {
    type: String
  },
  commentAddress: {
    type: String
  },
  commentTime: {
    type: Number
  }
});

var bookmarkSchema = new Schema({
  bookmarkUserId: {
    type: Schema.ObjectId
  },
  bookmarkVendorId: {
    type: Schema.ObjectId
  },
  bookmarkUserName: {
    type: String
  },
  bookmarkTime: {
    type: Number
  }
});

var contactCallSchema = new Schema({
  contactCallUserId: {
    type: Schema.ObjectId
  },
  contactCallVendorId: {
    type: Schema.ObjectId
  },
  contactNumber: {
    type: Number,
    required: true
  },
  contactCallUserName: {
    type: String
  },
  contactCallTime: {
    type: Number
  }
});

var vendorSchema = new Schema({
  name: {
    type: String
  },
  contact: {
    type: [Number]
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
  imageUrl: {
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
    type: String
  },
  coords: {
    type: [Number],
    index: '2dsphere'
  },
  homeDelivery: {
    type: Boolean,
    default: false
  },
  bookmark: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String
  },
  shopNo: {
    type: String
  },
  landmark: {
    type: String
  },
  status: {
    type: Number
  },
  userId: {
    type: Schema.ObjectId
  }
}, {
  strict: false
});

module.exports = mongoose.model('contactCallHistory', contactCallSchema);
module.exports = mongoose.model('bookmarkUsers', bookmarkSchema);
module.exports = mongoose.model('cleanvendor', vendorSchema);
module.exports = mongoose.model('vendorcomments', commentSchema);
