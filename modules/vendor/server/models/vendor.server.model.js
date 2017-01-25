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
  commentUserImageUrl: {
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
  serialnumber: {
    type: String
  },
  name: {
    type: String
  },
  contact: {
    type: String,
    default: ''
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
    type: Number,
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
    type: [Number]
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
  city: {
    type: String
  },
  userId: {
    type: Schema.ObjectId
  },
  keyword: {
    type: String
  },
  homeDelivery: {
    type: Boolean,
    default: false
  },
  gcmId: {
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
    default: true
  },
  platform: {
    type: String,
    default: ''
  },
  night: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    default: ''
  }
});

var bannerSchema = new Schema({
  imageUrl: {
    type: String
  },
  name: {
    type: String
  }
});

var tagSchema = new Schema({
  name: {
    type: String
  },
  tags: [{
    type: String
  }],
  cat: {
    type: String
  },
  subcat: {
    type: String
  }
});

module.exports = mongoose.model('bannerSchema', bannerSchema);
module.exports = mongoose.model('contactCallHistory', contactCallSchema);
module.exports = mongoose.model('bookmarkUsers', bookmarkSchema);
module.exports = mongoose.model('cleanvendor', vendorSchema);
module.exports = mongoose.model('vendorcomments', commentSchema);
module.exports = mongoose.model('tagschema', tagSchema);
