'use strict';

/* global Set b:true */

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  user = mongoose.model('chibleeusers'),
  vendor = mongoose.model('cleanvendor'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore'), // npm install underscore to install
  app = require('../../../../config/lib/app.js'),
  db = app.db(),
  async = require('async');
var request = require('request');
var accessKey = 'AKIAIAIBZ2HSPX3L35DA';
var secretKey = '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';
var os = require('os');
var fs = require('fs');
var AWS = require("aws-sdk");
var crypto = require('crypto');
var multer = require('multer');
var dedupe = require('dedupe');

var elastic = require('../../../../config/lib/elasticsearch.js');

exports.login = function(req, res) {
  var latitude = 0.0;
  var longitude = 0.0;
  if (req.body.latitude) {
    latitude = req.body.latitude;
  }
  if (req.body.longitude) {
    longitude = req.body.latitude;
  }
  var coords = [parseFloat(latitude), parseFloat(longitude)];
  user.findOne({
    deviceId: req.body.deviceId,
    email: req.body.email
  }, function(err, data) {
    if (err) {
      res.json({
        error: true,
        data: err
      });
    } else if (data) {
      // console.log(data);
      user.update({
        deviceId: req.body.deviceId,
        email: req.body.email
      }, {
        $set: {
          lastLogin: new Date().getTime(),
          lastLocation: coords
        }
      }, function(err, result) {
        if (err) {
          res.json({
            error: true,
            data: err
          });
        }
        res.json({
          error: false,
          data: data.authToken
        });
      });
    } else {
      var authToken = crypto.createHmac('sha256', req.body.deviceId).update(
        req.body.email).digest('hex');
      var newuser = new user({
        name: req.body.name,
        authToken: authToken,
        username: req.body.username,
        email: req.body.email,
        sim: req.body.sim,
        pushToken: req.body.pushToken,
        platform: req.body.platform,
        model: req.body.model,
        deviceId: req.body.deviceId,
        imageUrl: req.body.imageUrl,
        appVersion: req.body.appVersion,
        profileType: req.body.profileType,
        lastLogin: new Date().getTime(),
        signUpDate: new Date().getTime(),
        lastLocation: coords
      });
      newuser.save(newuser, function(err, result) {
        if (err) {
          res.json({
            error: true,
            data: err
          });
        }
        res.json({
          error: false,
          data: authToken
        });
      });
    }
  });
};

exports.category = function(req, res) {
  db.collection('category').distinct('category', function(err, docs) {
    doc.sort();
    if (err) {
      res.json({
        error: true,
        data: err
      });
    }
    res.json({
      error: false,
      data: docs
    });
  });
};

exports.subcategory = function(req, res) {
  if (!req.params.category) {
    res.json({
      error: true,
      data: 'category parameter required'
    });
  } else {
    db.collection('category').find({
      category: req.params.category
    }, {
      subCategory: 1,
      _id: 0
    }).toArray(function(err, docs) {
      // console.log(docs);
      var data = docs[0].subCategory.sort();
      if (err) {
        res.json({
          error: true,
          data: err
        });
      }
      res.json({
        error: false,
        data: data
      });
    });
  }
};


exports.areas = function(req, res) {
  var finalResult = [];
  vendor.find({}, {
    area: 1,
    latitude: 1,
    longitude: 1,
    _id: 0
  }).exec(function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    } else {
      var bbb = dedupe(docs, value => value.area);
      res.json({
        error: false,
        data: bbb
      });
    }
  });
}



// exports.addIndex = function(req, res) {
//   elastic.indexExists().then(function(exists) {
//     if (exists) {
//       return elastic.deleteIndex();
//     }
//   }).then(function() {
//     return elastic.initIndex().then(elastic.initMapping).then(function() {
//       var promises = [{
//         "Area": "Gurgaon Badshahpur",
//         "Categories": "Utilities",
//         "Name": "Mukesh Communication",
//         "Remarks": "-",
//         "Open": "07:00 AM",
//         "Close": "10:00 PM",
//         "Multi": "-",
//         "Address": "Near 171,  Shahpur Jat",
//         "Others": "mobile recharge,  mobile accessories,  mobile repair,  sim cards",
//         "Image": "https://s3-ap-southeast-1.amazonaws.com/chiblee/Mukesh communication28.3877077.jpg",
//         "Type": "Mobile Shop",
//         "Time": "2016-04-11 15:17:35.892",
//         "Upload Time": "2016-04-13T12:20:15.170488",
//         "Colour Comment": 0,
//         "status": "live",
//         "Username": "Shivam",
//         "Count": 0,
//         "location": [
//           28.3877077,
//           77.0515903
//         ],
//         "id": 1,
//         "LAT": 28.3877077,
//         "LON": 77.0515903,
//         "Sub-Cat": "Mobile Shop",
//         "Home": "No",
//         "Contact": "-",
//         "tags": "mobile recharge,  mobile accessories,  mobile repair,  sim cards",
//         "night": false
//       }].map(function(doc) {
//         return elastic.addDocument({
//           Name: doc.Name,
//           Type: doc.Type,
//           metadata: {
//             contentTime: Date.now()
//           }
//         });
//       });
//       return Promise.all(promises);
//     });
//   });
// }
//
exports.searchbyarea = function(req, res) {
  var inp = req.params.input;
  var area = req.params.area;
  var page = req.params.page;
  // es.search({
  //   index: 'chiblee',
  //   size: 10,
  //   from: 10 * (page - 1),
  //   body: {
  //     query: {
  //       filtered: {
  //         query: {
  //           multi_match: {
  //             "query": inp,
  //             "fields": ["type", "type1", "name"],
  //             "type": "phrase_prefix"
  //           }
  //         },
  //         filter: {
  //           "query": {
  //             "match": {
  //               "area": area
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }).then(function(resp) {
  //   console.log(resp);
  //   res.json({
  //     error: false,
  //     data: resp
  //   });
  // }, function(err) {
  //   return res.status(400).send({
  //     message: errorHandler
  //       .getErrorMessage(err)
  //   });
  // });
}

exports.getUserDetails = function(req, res) {
  res.json({
    error: false,
    data: req.user
  });
}


exports.updateUserDetails = function(req, res) {
  user.update({
    _id: req.user._id
  }, {
    '$set': req.body
  }, function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    res.json({
      error: false,
      data: 'successfully update'
    });
  })
}


exports.googlelocationapi = function(req, res) {
  var result = [];
  var radius = 1000;
  var locations = req.body.location;
  var type = req.body.type;
  var asyncTasks = [];
  var data = new Object({});
  var options = new Object({});
  var url = '';
  var flag1 = 1;
  _.forEach(locations, function(location) {
    asyncTasks.push(function(callback) {
      // console.log('location : ', location);
      var flag = 1;

      async.whilst(
        function() {
          return (flag == 1 && radius <= 5000);
        },
        function(callback1) {
          setTimeout(function() {
            if (flag1 == 1) {
              url =
                'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' +
                location + '&radius=' +
                radius +
                '&type=' + type +
                // '&key=AIzaSyCv-TLw1AqR32aV04sRXpdSTVbsur2hqew&pagetoken=';
                // '&key=AIzaSyBGFWKSZZbKfGD6OmF_Qc3DR2qMAinqxCw&pagetoken=';
                // '&key=AIzaSyAUccTAeCJE_I7DURx4utZs4h_gMAoJPN8&pagetoken=';
                '&key=AIzaSyBm6miUteung8V9molJzD69faWAA7InFGw&pagetoken=';

              options = {
                method: 'GET',
                url: url
              };
            }
            // console.log('options : ', options);
            request(options, function(error, resp,
              body) {
              // console.log('you are in request');
              if (error) {
                return res.status(400).send({
                  message: errorHandler
                    .getErrorMessage(
                      error)
                });
              } else if (!body) {
                return res.status(400).send({
                  message: 'No data find'
                });
              } else {
                flag1 = 0;
                data = JSON.parse(body);
                result.push(data);
                if (data.hasOwnProperty(
                    "next_page_token")) {
                  url =
                    'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' +
                    location + '&radius=' +
                    radius +
                    '&type=atm_store&key=AIzaSyAUccTAeCJE_I7DURx4utZs4h_gMAoJPN8&pagetoken=' +
                    data.next_page_token;
                  options = {
                    method: 'GET',
                    url: url
                  };
                  callback1();
                } else {
                  flag1 = 1;
                  radius = radius + 1000;
                  callback1();
                }
              }
            });
          }, 1500);
        },
        function() {
          callback();
        });
    });
  });
  async.parallel(asyncTasks, function() {
    res.json({
      result: result
    });
  });
};


exports.geoAddress = function(req, res) {
  var parameter = req.body.data;
  var asyncTasks = [];
  var finalresult = [];
  parameter.forEach(function(doc) {
    asyncTasks.push(function(callback) {
      var location = doc.address;
      var url =
        'https://maps.googleapis.com/maps/api/geocode/json?address=' +
        location;

      var options = {
        method: 'GET',
        url: url
      };
      // console.log('options : ', options);
      request(options, function(error, resp,
        body) {
        if (error) {
          return res.status(400).send({
            message: errorHandler
              .getErrorMessage(
                error)
          });
        } else if (!body) {
          return res.status(400).send({
            message: 'No data find'
          });
        } else {
          var data = JSON.parse(body);
          // console.log(data);
          var data1 = new Object({
            "address": doc.address,
            "lat": data.results[0].geometry.location.lat,
            "lng": data.results[0].geometry.location.lng
          });
          finalresult.push(data1);
          callback();
        }
      });
    });
  });
  async.parallel(asyncTasks, function() {
    if (finalresult.length == parameter.length)
      res.send(finalresult);
  });
}


exports.geoLatLng = function(req, res) {
  var parameter = req.body.data;
  var asyncTasks = [];
  var finalresult = [];
  parameter.forEach(function(doc) {
    asyncTasks.push(function(callback) {
      var url =
        'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
        doc.lat + ',' + doc.lng +
        '&key=AIzaSyC_M9kUfZ1B8OfbLvYAaXv1b3Ao8jAr6N0';

      var options = {
        method: 'GET',
        url: url
      };
      // console.log('options : ', options);
      request(options, function(error, resp,
        body) {
        if (error) {
          return res.status(400).send({
            message: errorHandler
              .getErrorMessage(
                error)
          });
        } else if (!body) {
          return res.status(400).send({
            message: 'No data find'
          });
        } else {
          var data = JSON.parse(body);
          // console.log(data.results[0].formatted_address);
          var data1 = new Object({
            "lat": doc.lat,
            "lng": doc.lng,
            "address": data.results[0].formatted_address
          });
          finalresult.push(data1);
          callback();
        }
      });
    });
  });
  async.parallel(asyncTasks, function() {
    if (finalresult.length == parameter.length)
      res.send(finalresult);
  });
}

exports.temp = function(req, res) {
  var coordinates = [77.15911, 28.7197545];
  var query = {
    "coords": {
      $geoWithin: {
        $centerSphere: [coordinates, 5]
      }
    }
  };

  vendor.aggregate([{
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [77.291919, 28.499121]
      },
      distanceField: "distance",
      maxDistance: 5000,
      query: {

      },
      spherical: true
    }
  }, {
    $skip: 4
  }, {
    $limit: 5
  }], function(err, docs) {
    res.json({
      data: docs
    });
  });

  // vendor.find(query, function(err, docs) {
  //   console.log(docs);
  // });
}
