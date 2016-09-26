var mongoose = require('mongoose'),
  user = mongoose.model('chibleeusers');

exports.userAuthenticate = function(req, res, next) {
  var authKey = req.headers.authorization;
  if (!authKey) return res.status(400).json({
    'message': 'Authkey needed'
  });
  user.find({
    authToken: authKey
  }).exec(function(err, user) {
    if (err) return res.status(500).send('Unexpected authorization error');
    if (!user || (user.length === 0)) {
      return res.status(403).json({
        message: 'User is not authorized'
      });
    }
    req.user = user[0];
    return next();
  });
};
//
// exports.moduserAuthenticate = function(req, res, next) {
//   // var authKey = req.headers.authorization;
//
//   var authKey = req.headers["authorization"];
//
//   if (!authKey) return res.status(400).json({
//     'message': 'Authkey needed'
//   });
//   modusers.findOne({
//     authToken: authKey
//   }, function(err, user) {
//     if (err) return res.status(500).send('Unexpected authorization error');
//     if (!user || (user.length === 0)) {
//       return res.status(403).json({
//         message: 'User is not authorized'
//       });
//     }
//
//     req.user = user;
//     return next();
//   });
// };
