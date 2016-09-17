var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var profileSchema = new Schema({
  profileType: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  uid: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  }

});

var userSchema = new Schema({
  name: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
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
    default: ''
  },
  Model: {
    type: String,
    default: ''
  },
  SDK: {
    type: Number,
    default: ''
  },
  deviceID: {
    type: String,
    default: ''
  },
  contact: {
    type: Number,
    default: ''
  },
  installDate: {
    type: Date,
    default: Date.now
  },
  profile: [profileSchema],
  image: {
    type: String,
    default: ''
  },
  appVersion: {
    type: String,
    default: ''
  }
});

var chibleeUserSchema = new Schema({
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
  loginDate: {
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
  }
});



module.exports = mongoose.model('users', userSchema);
module.exports = mongoose.model('chibleeusers', chibleeUserSchema);

module.exports = mongoose.model('profile', profileSchema);
