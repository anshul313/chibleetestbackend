'use strict';

/* global Set b:true */

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  user = mongoose.model('chibleeusers'),
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

var elastic = require('../../../../config/lib/elasticsearch.js');

exports.login = function(req, res) {

  user.findOne({
    deviceId: req.body.deviceId,
    email: req.body.email
  }, function(err, data) {
    if (err) {
      res.json({
        error: true,
        data: err
      });
      return SendResponse(res);
    } else if (data) {
      // console.log(data);
      res.json({
        error: false,
        data: data.authToken
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
        profileType: req.body.profileType
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
      if (err) {
        res.json({
          error: true,
          data: err
        });
      }
      res.json({
        error: false,
        data: docs[0].subCategory
      });
    });
  }
};


exports.areas = function(req, res) {
  db.collection('vendors').distinct('Area', function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    } else {
      docs.sort();
      res.json({
        error: false,
        data: docs
      });
    }
  });
}

exports.listarea = function(req, res) {
  var subcat = req.params.subcat;
  var area = req.params.area;
  var limit = 10;
  var skip = limit * parseInt(req.params.page);
  db.collection('vendors').find({
    'Sub-Cat': subcat,
    'night': false,
    'Area': new RegExp('^' + area + '$', "i")
  }).skip(skip).limit(limit).toArray(function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    } else {
      res.json({
        error: false,
        data: docs
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
