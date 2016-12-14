var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
var bcrypt = require('bcryptjs');

// ModUser Schema
var ModUserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String
  }
});

var ModUser = module.exports = mongoose.model('ModUser', ModUserSchema);

module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.getUserByUsername = function(username, callback) {
  var query = {
    username: username
  };
  ModUser.findOne(query, callback);
}

module.exports.getUserById = function(id, callback) {
  console.log('getUserById  :  ', id);
  ModUser.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  console.log('comparePassword   :  ', candidatePassword);
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
}
