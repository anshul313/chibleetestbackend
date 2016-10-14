'use strict';

/* global Set b:true */

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  vendor = mongoose.model('cleanvendor'),
  contactHistory = mongoose.model('contactCallHistory'),
  comment = mongoose.model('vendorcomments'),
  bookmarkUsers = mongoose.model('bookmarkUsers'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'), // npm install underscore to install
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
var MongoClient = require("mongodb").MongoClient;
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var async = require("async");
var xlsxj = require("xlsx-to-json");


// var elastic = require('../../../../config/lib/elasticsearch.js');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: Infinity,

  // undocumented params are appended to the query string
  hello: "elasticsearch!"
}, function(error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

// var elasticsearch = require('elasticsearch');
// var es = elasticsearch.Client({
//   hosts: '52.77.1.79:9200'
// });

exports.getvendors = function(req, res) {
  var finalresult = [];
  var asyncTasks = [];
  vendor.find({
    coords: {
      $nearSphere: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
      $minDistance: 0,
      $maxDistance: req.body.radius,
    },
    category: req.body.cat,
    subCategory: req.body.subcat
  }).skip(req.body.page * 10).limit(10).exec(function(err, data) {
    // console.log('Data : ', data);
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    data.forEach(function(doc) {
      asyncTasks.push(function(callback) {
        var bookmark = 0;
        var vendorId = doc['_id'].toString();
        bookmarkUsers.find({
          bookmarkUserId: req.user._id
        }).distinct('bookmarkVendorId', function(err,
          bookmarkvendorIds) {
          comment.find({
            vendorId: vendorId
          }, function(err, result) {
            if (err) {
              return res.status(400).send({
                message: errorHandler
                  .getErrorMessage(
                    err)
              });
            }
            var totalRating = 0;
            for (var i = 0; i < result.length; i++)
              totalRating += result[i].commentRating;
            if (totalRating > 0)
              totalRating = totalRating / result.length;
            var temp = [];
            for (var i = 0; i < bookmarkvendorIds.length; i++)
              temp.push(bookmarkvendorIds[i].toString())
            if (_.includes(temp, doc['_id'].toString()))
              bookmark = 1;
            // var q = bookmarkvendorIds.indexOf(doc['_id'])
            var obj = new Object({
              _id: doc['_id'],
              name: doc['name'],
              contact: doc['contact'],
              category: doc['category'],
              subCategory: doc['subCategory'],
              address: doc['address'],
              area: doc['area'],
              latitude: doc['latitude'],
              longitude: doc['longitude'],
              closingTiming: doc['closingTiming'],
              openingTiming: doc['openingTiming'],
              imageUrl: doc['imageUrl'],
              saveTime: doc['saveTime'],
              multiTime: doc['multiTime'],
              others: doc['others'],
              tags: doc['tags'],
              coords: doc['coords'],
              homeDelivery: doc['homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: bookmark
            });
            finalresult.push(obj);
            callback(err, obj);
          });
        });
      });
    });
    async.parallel(asyncTasks, function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler
            .getErrorMessage(
              err)
        });
      }
      res.json({
        error: false,
        data: finalresult
      });
    });
  });
}

exports.vendorByArea = function(req, res) {
  // console.log('subcategory : ', req.params.subcat);
  // console.log('area : ', req.params.area);
  var finalresult = [];
  var asyncTasks = [];
  var subcat = req.params.subcat;
  var area = req.params.area;
  var limit = 10;
  var skip = limit * parseInt(req.params.page);
  vendor.find({
    'subCategory': subcat,
    'area': new RegExp('^' + area + '$', "i")
  }).skip(skip).limit(limit).exec(function(err, data) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    data.forEach(function(doc) {
      asyncTasks.push(function(callback) {
        var bookmark = 0;
        var vendorId = doc['_id'].toString();
        bookmarkUsers.find({
          bookmarkUserId: req.user._id
        }).distinct('bookmarkVendorId', function(err,
          bookmarkvendorIds) {
          comment.find({
            vendorId: vendorId
          }, function(err, result) {
            if (err) {
              return res.status(400).send({
                message: errorHandler
                  .getErrorMessage(
                    err)
              });
            }
            var totalRating = 0;
            for (var i = 0; i < result.length; i++)
              totalRating += result[i].commentRating;
            if (totalRating > 0)
              totalRating = totalRating / result.length;
            var temp = [];
            for (var i = 0; i < bookmarkvendorIds.length; i++)
              temp.push(bookmarkvendorIds[i].toString())
            if (_.includes(temp, doc['_id'].toString()))
              bookmark = 1;
            // var q = bookmarkvendorIds.indexOf(doc['_id'])
            var obj = new Object({
              _id: doc['_id'],
              name: doc['name'],
              contact: doc['contact'],
              category: doc['category'],
              subCategory: doc[
                'subCategory'],
              address: doc['address'],
              area: doc['area'],
              latitude: doc['latitude'],
              longitude: doc['longitude'],
              closingTiming: doc[
                'closingTiming'],
              openingTiming: doc[
                'openingTiming'],
              imageUrl: doc['imageUrl'],
              saveTime: doc['saveTime'],
              multiTime: doc['multiTime'],
              others: doc['others'],
              tags: doc['tags'],
              coords: doc['coords'],
              homeDelivery: doc[
                'homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: data['bookmark']
            });
            finalresult.push(obj);
            callback(err, obj);
          });
        });
      });
    });
    async.parallel(asyncTasks, function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler
            .getErrorMessage(
              err)
        });
      }
      res.json({
        error: false,
        data: finalresult
      });
    });
  });
}


exports.getelasticsearchbylatlng = function(req, res) {
  db.collection('cleanvendor').find({
    coords: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [77.15911, 28.7197545]
        },
        $minDistance: 0,
        $maxDistance: 5000,
        distanceMultiplier: 3963.2
      }
    }
  }).toArray(function(err, result) {
    if (err)
      console.log('error : ', err);
    console.log('result : ', result);
  });
}


exports.getelasticvendor = function(req, res) {
  var inp = req.params.input;
  var area = req.params.area;
  var page = req.params.page;
  client.search({
    index: 'cleanvendors',
    type: 'Document',
    size: 10,
    from: 10 * (page - 1),
    body: {
      query: {
        filtered: {
          query: {
            multi_match: {
              "query": inp,
              "fields": ["name", "category", "tags"],
              "type": "phrase_prefix"
            }
          },
          filter: {
            "query": {
              "match": {
                "area": area
              }
            }
          }
        }
      }
    }
  }).then(function(resp) {
    var result = [];
    for (var i = 0; i < resp.hits.hits.length; i++)
      result.push(resp.hits.hits[i]['_source']);
    res.json({
      error: false,
      data: result
    });
  }, function(err) {
    console.log('Error : ', err);
  });
}


exports.addvendor = function(req, res) {
  console.log('add vendor');
  var i = 0;
  var q = 44517;
  var count = 1;
  var fs = require('fs');
  var JSONStream = require('JSONStream');
  var es = require('event-stream');

  for (var k = 1; k < 438; k++) {
    // console.log('K : ', k);
    // var fileStream = fs.createReadStream(
    //   path.resolve(__dirname, 'data.json'), {
    //     encoding: 'utf8'
    //   });
    // fileStream.pipe(JSONStream.parse('*')).pipe(es.through(function(
    //   data) {
    //   // console.log('printing one customer object read from file ::');
    //   // console.log(data, "   : ", ++i);
    //   this.pause();
    //   processOneCustomer(data, this);
    //   return data;
    // }), function end() {
    //   console.log('stream reading ended');
    //   this.emit('end');
    // });

    // function processOneCustomer(data, es) {
    //   console.log(data.length);

    var stream = fs.createReadStream(path.resolve(__dirname, 'atm/atm_(' + k +
        ').json'), {
        encoding: 'utf8'
      }),
      parser = JSONStream.parse();

    stream.pipe(parser);

    parser.on('data', function(data) {
      console.log('data : ', data.result[0]);
      for (i = 0; i < data.result.length; i++) {
        // console.log('data : ', data);
        // console.log(data[i]['Name of vendor']);
        // console.log(data[i]['Contact']);
        // console.log(data[i]['Category']);
        // console.log(data[i]['Sub-category']);

        // var add = data[i]['Address'];
        // if (add === "") {
        //   add = data[i]['Address_raw'];
        // }
        // if (data[i]['Latitude'] === "-")
        //   data[i]['Latitude'] = 0;
        // if (data[i]['Longitude'] === "-")
        //   data[i]['Longitude'] = 0;

        // console.log(data[i]['Location']);
        // console.log(data[i]['Latitude']);
        // console.log(data[i]['Longitude']);
        // console.log(data[i]['Open_timing']);
        // console.log(data[i]['Image']);
        // console.log(data[i]['Others_raw']);
        // console.log('Home Delivery : ', data[i]['Home Delivery?']);
        // console.log('remarsks : ', data[i]['Remark_raw']);

        // var tags = data[i]['Tags'].split(',');
        // console.log('tags : ', tags);

        // var coordinate = [];
        // coordinate.push(data[i]['Longitude']);
        // coordinate.push(data[i]['Latitude']);
        // var homeDelivery = false;
        // if (data[i]['Home Delivery?'] != "No") {
        //   homeDelivery = true;
        // }

        // var bookmark = false;
        // if (req.body.bookmark)
        //   bookmark = req.body.bookmark;
        //
        // var rating = 0;
        // if (req.body.rating)
        //   rating = req.body.rating;

        // var tag1 = data[i]['Others_raw'].split(",");
        // for (var i = 0; i < tags.length; i++)
        //   tags.push(tag1[i]);
        // var vendorContact = ;

        // var vendorData = {
        //   serialnumber: data[i]['S.No.'],
        //   name: data[i]['Name of vendor'],
        //   contact: data[i]['Contact'].toString(),
        //   category: data[i]['Category'],
        //   subCategory: data[i]['Sub-category'],
        //   address: add,
        //   area: data[i]['Location'],
        //   latitude: data[i]['Latitude'],
        //   longitude: data[i]['Longitude'],
        //   openingTiming: data[i]['Open_timing'],
        //   closingTiming: data[i]['Close_timing'],
        //   imageUrl: data[i]['Image'],
        //   saveTime: new Date().getTime(),
        //   multiTime: data[i]['Multi'],
        //   others: data[i]['Others_raw'],
        //   tags: data[i]['Tags'],
        //   coords: coordinate,
        //   homeDelivery: homeDelivery,
        //   remarks: data[i]['Remarks'],
        //   shopNo: '',
        //   landMark: add,
        //   status: 1,
        //   keyword: data[i]['TAGS']
        // };
        // console.log('data [i] : ', data.result[0]);



        if (data.result[0].results.length > 0) {
          // console.log("lat", data[i].results[0].geometry.location.lat);
          // console.log("lng", data[i].results[0].geometry.location.lng);
          for (var j = 0; j < data.result[0].results.length; j++) {

            var vicinityArea = data.result[0].results[j].vicinity.split(
              ",");
            if (vicinityArea.length > 2) {
              var area = vicinityArea[vicinityArea.length - 2];
            } else {
              var area = data.result[0].results[j].vicinity;
            }

            var coordinate = [];
            coordinate.push(data.result[0].results[j].geometry.location
              .lng);
            coordinate.push(data.result[0].results[j].geometry.location
              .lat);


            var vendorData = new Object({
              serialnumber: data.result[0].results[j].place_id,
              name: data.result[0].results[j].name,
              contact: '-',
              category: 'Owl',
              subCategory: 'Atm',
              address: data.result[0].results[j].vicinity,
              area: area,
              latitude: data.result[0].results[j].geometry.location
                .lat,
              longitude: data.result[0].results[j].geometry.location
                .lng,
              openingTiming: '24',
              closingTiming: '0',
              imageUrl: data.result[0].results[j].icon,
              saveTime: new Date().getTime(),
              multiTime: true,
              others: '-',
              tags: 'atm',
              coords: coordinate,
              homeDelivery: false,
              remarks: '-',
              shopNo: '',
              landMark: data.result[0].results[j].vicinity,
              status: 1,
              keyword: data.result[0].results[j].types[0]
            });

            // var vendorData = new Object({
            //   "latitude": data[i].results[j].geometry.location.lat,
            //   "longitude": data[i].results[j].geometry.location.lng,
            //   "placeId": data[i].results[j].place_id,
            //   "area": area,
            //   "category": "Owl",
            //   "subCategory": "ATM",
            //   "name": data[i].results[j].name,
            //   "homeDelivery": "No",
            //   "remarks": "-",
            //   "open": "24x7",
            //   "close": "-",
            //   "multipleTiming": "NA",
            //   "contactNo": "-",
            //   "address": data[i].results[j].vicinity,
            //   "tag": ["ATM"],
            //   "image": data[i].results[j].icon,
            //   "type": data[i].results[j].types,
            //   "time": Date.now(),
            //   "uploadtime": Date.now(),
            //   "status": "live",
            //   "username": data[i].results[j].scope
            // });

            console.log('vendor data', vendorData)

            var query = {
              serialnumber: data.result[0].results[j].place_id
            };

            client.index({
              index: 'cleanvendors',
              type: 'Document',
              id: ++q,
              body: vendorData
            }, function(error, response) {
              console.log('index created');
            });

            vendor.findOneAndUpdate(query, vendorData, {
              upsert: true
            }, function(err, doc) {
              if (err) {
                console.log('error : ', err);
              }
              console.log("succesfully saved");
            });
          }
        }
      }
    });
    parser.on('end', function(item) {
      console.log('data 1 : ', q);
      console.log('end'); // whatever you will do with each JSON object
      // data1.push(obj.address);
    });
    // res.send('successfully insetred');
    // }
  }
}

exports.addcomment = function(req, res) {
  var vendorId = new ObjectID(req.body.vendorId);
  var milliseconds = (new Date).getTime();
  // milliseconds = milliseconds + 1980000;
  var newcomment = {
    commentText: req.body.commentText,
    commentRating: req.body.commentRating,
    commentUserId: req.user._id,
    vendorId: vendorId,
    commentAddress: req.body.commentAddress,
    commentUserName: req.user.name,
    commentUserImageUrl: req.user.imageUrl,
    commentTime: milliseconds
  };

  comment.update({
    commentUserId: req.user._id,
    commentText: req.body.commentText
  }, {
    $set: newcomment
  }, {
    upsert: true
  }, function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    res.json({
      error: false,
      data: 'successfully inserted'
    });
  });
}

exports.getcomments = function(req, res) {
  var asyncTasks = [];
  var finalResult = [];
  var vendorId = new ObjectID(req.params.vendorId)
  comment.find({
    vendorId: vendorId
  }, function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    var totalRating = 0;
    for (var i = 0; i < result.length; i++)
      totalRating += result[i].commentRating;
    if (totalRating > 0)
      totalRating = totalRating / result.length;
    result.forEach(function(item) {
      asyncTasks.push(function(callback) {
        var now = (new Date).getTime();
        var then = item.commentTime;
        var diff = moment(moment(now).diff(then)).format(
          'DD:HH:mm:ss');
        var date = diff.split(':');
        var day = 0;
        if (date[0] > 1)
          day = date[0];
        var hours = 0;
        if (date[1] > 0)
          hours = date[1];
        var minutes = 0;
        if (date[2] > 0)
          minutes = date[2];
        var second = 0;
        if (date[3] > 0)
          second = date[3];
        vendor.find({
          _id: item['vendorId']
        }).exec(function(err, docs) {
          var obj = new Object({
            _id: item['_id'],
            commentText: item['commentText'],
            commentUserId: item['commentUserId'],
            commentRating: item['commentRating'],
            vendorId: item['vendorId'],
            commentUserName: item['commentUserName'],
            commentUserImageUrl: item[
              'commentUserImageUrl'],
            commentTime: item['commentTime'],
            commentAddress: req.body.commentAddress,
            day: day,
            hours: hours,
            minutes: minutes,
            second: second,
            vendorDetail: docs
          });
          finalResult.push(obj)
          callback();
        });
      });
    });
    async.parallel(asyncTasks, function() {
      res.json({
        error: false,
        data: {
          result: finalResult,
          totalRating: totalRating
        }
      });
    });
  });
}

exports.getVendorsByRating = function(req, res) {
  var finalresult = [];
  var asyncTasks = [];
  comment.aggregate([{
    "$match": {
      "category": req.body.category,
      "subCategory": req.body.subCategory,
    }
  }, {
    $group: {
      "_id": "$vendorId",
      "commentRating": {
        $avg: '$commentRating'
      },
      count: {
        $sum: 1
      }
    },
  }, {
    $sort: {
      commentRating: -1
    }
  }], function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }

    docs.forEach(function(doc) {
      asyncTasks.push(function(callback) {
        var bookmark = 0;
        var verdorID = new ObjectID(doc['_id']);
        bookmarkUsers.find({
          bookmarkUserId: req.user._id
        }).distinct('bookmarkVendorId', function(err,
          bookmarkvendorIds) {
          comment.find({
            vendorId: verdorID
          }, function(err, result) {
            if (err) {
              return res.status(400).send({
                message: errorHandler
                  .getErrorMessage(
                    err)
              });
            }
            var totalRating = 0;
            for (var i = 0; i < result.length; i++)
              totalRating += result[i].commentRating;
            if (totalRating > 0)
              totalRating = totalRating / result.length;
            var temp = [];
            for (var i = 0; i < bookmarkvendorIds.length; i++)
              temp.push(bookmarkvendorIds[i].toString())
            if (_.includes(temp, doc['_id'].toString()))
              bookmark = 1;
            vendor.findOne({
              _id: verdorID
            }, function(err, data) {
              if (data) {
                var obj = new Object({
                  _id: data['_id'],
                  name: data['name'],
                  contact: data['contact'],
                  category: data['category'],
                  subCategory: data[
                    'subCategory'],
                  address: data['address'],
                  area: data['area'],
                  latitude: data['latitude'],
                  longitude: data['longitude'],
                  closingTiming: data[
                    'closingTiming'],
                  openingTiming: data[
                    'openingTiming'],
                  imageUrl: data['imageUrl'],
                  saveTime: data['saveTime'],
                  multiTime: data['multiTime'],
                  others: data['others'],
                  tags: data['tags'],
                  coords: data['coords'],
                  homeDelivery: data[
                    'homeDelivery'],
                  remarks: data['remarks'],
                  shopNo: '',
                  landmark: data['landmark'],
                  status: data['status'],
                  rating: totalRating,
                  bookmark: data['bookmark']
                });
                finalresult.push(obj);
                callback(err, obj);
              } else {
                callback();
              }
            });
          });
        });
      });
    });
    async.parallel(asyncTasks, function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler
            .getErrorMessage(
              err)
        });
      }
      res.json({
        error: false,
        data: finalresult
      });
    });
  });
}

exports.getVendorsByHomeDelivery = function(req, res) {
  var vendorIds = [];
  var finalresult = [];
  var asyncTasks = [];
  vendor.find({
    coords: {
      $nearSphere: [parseFloat(req.body.lat), parseFloat(req.body.lng)],
      $minDistance: 0,
      $maxDistance: req.body.radius,
    },
    "homeDelivery": true,
  }).skip(req.body.page * 10).limit(10).exec(function(err, data) {
    // console.log('Data : ', data);
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    data.forEach(function(doc) {
      asyncTasks.push(function(callback) {
        var bookmark = 0;
        var vendorId = doc['_id'].toString();
        bookmarkUsers.find({
          bookmarkUserId: req.user._id
        }).distinct('bookmarkVendorId', function(err,
          bookmarkvendorIds) {
          comment.find({
            vendorId: vendorId
          }, function(err, result) {
            if (err) {
              return res.status(400).send({
                message: errorHandler
                  .getErrorMessage(
                    err)
              });
            }
            var totalRating = 0;
            for (var i = 0; i < result.length; i++)
              totalRating += result[i].commentRating;
            if (totalRating > 0)
              totalRating = totalRating / result.length;
            var temp = [];
            for (var i = 0; i < bookmarkvendorIds.length; i++)
              temp.push(bookmarkvendorIds[i].toString())
            if (_.includes(temp, doc['_id'].toString()))
              bookmark = 1;
            var obj = new Object({
              _id: doc['_id'],
              name: doc['name'],
              contact: doc['contact'],
              category: doc['category'],
              subCategory: doc[
                'subCategory'],
              address: doc['address'],
              area: doc['area'],
              latitude: doc['latitude'],
              longitude: doc['longitude'],
              closingTiming: doc[
                'closingTiming'],
              openingTiming: doc[
                'openingTiming'],
              imageUrl: doc['imageUrl'],
              saveTime: doc['saveTime'],
              multiTime: doc['multiTime'],
              others: doc['others'],
              tags: doc['tags'],
              coords: doc['coords'],
              homeDelivery: doc[
                'homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: data['bookmark']
            });
            finalresult.push(obj);
            callback(err, obj);
          });
        });
      });
    });
    async.parallel(asyncTasks, function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler
            .getErrorMessage(
              err)
        });
      }
      res.json({
        error: false,
        data: finalresult
      });
    });
  });
}

exports.getVendorsByOpen = function(req, res) {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  console.log(+d);
  var midnighttime = (+d);
  var now = (new Date).getTime();
  var diff = moment(moment(now).diff(then)).format(
    'HH:mm:ss');
  var date = diff.split(':');
  var hours = 0;
  if (date[0] > 0)
    hours = date[0];
  var minutes = 0;
  if (date[1] > 0)
    minutes = date[1];
  var second = 0;
  if (date[2] > 0)
    second = date[2];
  var vendorIds = [];
  var finalresult = [];
  var asyncTasks = [];
  vendor.find({
    coords: {
      $nearSphere: [parseFloat(req.body.lat), parseFloat(req.body.lng)],
      $minDistance: 0,
      $maxDistance: req.body.radius,
    },
    "homeDelivery": true,
  }).skip(req.body.page * 10).limit(10).exec(function(err, data) {
    // console.log('Data : ', data);
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    data.forEach(function(doc) {
      asyncTasks.push(function(callback) {
        var vendorId = doc['_id'].toString();
        comment.find({
          vendorId: vendorId
        }, function(err, result) {
          if (err) {
            return res.status(400).send({
              message: errorHandler
                .getErrorMessage(
                  err)
            });
          }
          var totalRating = 0;
          for (var i = 0; i < result.length; i++)
            totalRating += result[i].commentRating;
          if (totalRating > 0)
            totalRating = totalRating / result.length;
          var obj = new Object({
            _id: doc['_id'],
            name: doc['name'],
            contact: doc['contact'],
            category: doc['category'],
            subCategory: doc[
              'subCategory'],
            address: doc['address'],
            area: doc['area'],
            latitude: doc['latitude'],
            longitude: doc['longitude'],
            closingTiming: doc[
              'closingTiming'],
            openingTiming: doc[
              'openingTiming'],
            imageUrl: doc['imageUrl'],
            saveTime: doc['saveTime'],
            multiTime: doc['multiTime'],
            others: doc['others'],
            tags: doc['tags'],
            coords: doc['coords'],
            homeDelivery: doc[
              'homeDelivery'],
            remarks: doc['remarks'],
            shopNo: '',
            landmark: doc['landmark'],
            status: doc['status'],
            rating: totalRating,
            bookmark: data['bookmark']
          });
          finalresult.push(obj);
          callback(err, obj);
        });
      });
    });
    async.parallel(asyncTasks, function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler
            .getErrorMessage(
              err)
        });
      }
      res.json({
        error: false,
        data: finalresult
      });
    });
  });
}


exports.addBookMark = function(req, res) {
  var vendorId = new ObjectID(req.params.vendorId);
  if (req.params.status == 1) {
    var milliseconds = (new Date).getTime();
    milliseconds = milliseconds + 19800000;
    var newbookmark = {
      bookmarkUserId: req.user._id,
      bookmarkVendorId: vendorId,
      bookmarkUserName: req.user.name,
      bookmarkTime: milliseconds
    };
    bookmarkUsers.update({
      bookmarkUserId: req.user._id,
      bookmarkVendorId: vendorId
    }, {
      $set: newbookmark
    }, {
      upsert: true
    }, function(err, result) {
      if (err) {
        return res.status(400).send({
          error: true,
          data: err
        });
      }
      vendor.update({
        _id: vendorId
      }, {
        $set: {
          bookmark: true
        }
      }, function(err, result) {
        res.json({
          error: false,
          data: 'successfully inserted'
        });
      });
    });
  } else {
    bookmarkUsers.remove({
      bookmarkUserId: req.user._id,
      bookmarkVendorId: vendorId
    }, function(err, result) {
      if (err) {
        return res.status(400).send({
          error: true,
          data: err
        });
      }
      vendor.update({
        _id: vendorId
      }, {
        $set: {
          bookmark: false
        }
      }, function(err, result) {
        res.json({
          error: false,
          data: 'successfully deleted'
        });
      });
    });
  }
}

// exports.deleteBookMark = function(req, res) {
//   var vendorId = new ObjectID(req.params.vendorId);
//   bookmarkUsers.remove({
//     bookmarkUserId: req.user._id,
//     bookmarkVendorId: vendorId
//   }, function(err, result) {
//     if (err) {
//       return res.status(400).send({
//         error: true,
//         data: err
//       });
//     }
//     vendor.update({
//       _id: vendorId
//     }, {
//       $set: {
//         bookmark: false
//       }
//     }, function(err, result) {
//       res.json({
//         error: false,
//         data: 'successfully deleted'
//       });
//     });
//   });
// }

exports.getBookMark = function(req, res) {
  var finalresult = [];
  var asyncTasks = [];
  var limit = 10;
  var skip = limit * parseInt(req.params.page);
  console.log(req.user._id);
  bookmarkUsers.find({
    bookmarkUserId: req.user._id
  }).distinct('bookmarkVendorId', function(err, bookmarkvendorIds) {
    console.log(bookmarkvendorIds);
    vendor.find({
      _id: {
        '$in': bookmarkvendorIds
      }
    }).skip(skip).limit(limit).exec(function(err, data) {
      data.forEach(function(doc) {
        asyncTasks.push(function(callback) {
          var bookmark = 0;
          var vendorId = doc['_id'].toString();

          comment.find({
            vendorId: vendorId
          }, function(err, result) {
            if (err) {
              return res.status(400).send({
                message: errorHandler
                  .getErrorMessage(
                    err)
              });
            }
            var totalRating = 0;
            for (var i = 0; i < result.length; i++)
              totalRating += result[i].commentRating;
            if (totalRating > 0)
              totalRating = totalRating / result.length;

            var obj = new Object({
              _id: doc['_id'],
              name: doc['name'],
              contact: doc['contact'],
              category: doc['category'],
              subCategory: doc[
                'subCategory'],
              address: doc['address'],
              area: doc['area'],
              latitude: doc['latitude'],
              longitude: doc['longitude'],
              closingTiming: doc[
                'closingTiming'],
              openingTiming: doc[
                'openingTiming'],
              imageUrl: doc['imageUrl'],
              saveTime: doc['saveTime'],
              multiTime: doc['multiTime'],
              others: doc['others'],
              tags: doc['tags'],
              coords: doc['coords'],
              homeDelivery: doc[
                'homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: 1
            });


            finalresult.push(obj);
            callback(err, obj);
          });
        });
      });
      async.parallel(asyncTasks, function(err, result) {
        if (err) {
          return res.status(400).send({
            message: errorHandler
              .getErrorMessage(
                err)
          });
        }
        res.json({
          error: false,
          data: finalresult
        });
      });
    })
  });
}

exports.getsuggestion = function(req, res) {
  // var finalresult = [];
  // async.parallel([
  //     function(callback) {
  //       vendor.find({
  //         'area': new RegExp('^' + req.params.inp, "i")
  //       }, {
  //         area: 1,
  //         _id: 0
  //       }).exec(function(err, data) {
  //         if (err) {
  //           callback(err, null);
  //         }
  //         // console.log('area : ', data);
  //         _.concat(finalresult, data);
  //         callback(null, data);
  //       });
  //     },
  //     function(callback) {
  //       vendor.find({
  //         'type': new RegExp('^' + req.params.inp, "i")
  //       }, {
  //         type: 1,
  //         _id: 0
  //       }).exec(function(err, data) {
  //         if (err) {
  //           callback(err, null);
  //         }
  //         // console.log('type : ', data);
  //         _.concat(finalresult, data);
  //         callback(null, data);
  //       });
  //     },
  //     function(callback) {
  //       vendor.find({
  //         'tags': new RegExp('^' + req.params.inp, "i")
  //       }, {
  //         tags: 1,
  //         _id: 0
  //       }).exec(function(err, data) {
  //         if (err) {
  //           callback(err, null);
  //         }
  //         // console.log('tags : ', data);
  //         _.concat(finalresult, data);
  //         callback(null, data);
  //       });
  //     }
  //   ],
  //   function(err, results) {
  //     // console.log('results : ', results[0]);
  //     // for (var j = 0; j < results.length; j++) {
  //     //   for (var i = 0; i < results[i].length; i++) {
  //     //       if()
  //     //   }
  //     // }
  //
  //     res.send(finalresult);
  //   });
  // client.suggest({
  //   index: 'cleanvendors',
  //   type: 'Document',
  //   body: {
  //     text: req.params.inp,
  //     bodySuggester: {
  //       phrase: {
  //         "field": 'name'
  //       }
  //     }
  //   }
  // }).then(function(resp) {
  var finalResult = [];
  vendor.find({
    'tags': new RegExp('^' + req.params.inp, "i")
  }, {
    tags: 1,
    category: 1,
    subCategory: 1,
    area: 1,
    _id: 0
  }).exec(function(err, resp) {
    console.log('response : ', resp);
    for (var i = 0; i < resp.length; i++) {
      // var data = resp[j].split(',');
      // for (var i = 0; i < data.length; i++) {
      //   console.log('data : ', data[i]);
      var suggest = resp[i];
      var result = _.indexOf(finalResult, suggest);
      if (result == -1)
        finalResult.push(suggest);
      // }
    }
    res.json({
      err: false,
      data: finalResult
    });
  });
}

exports.vendorByTags = function(req, res) {
  // console.log('subcategory : ', req.params.subcat);
  // console.log('area : ', req.params.area);
  var finalresult = [];
  var asyncTasks = [];
  var subcat = req.params.subcat;
  var tag = req.params.tag;
  var area = req.params.area;
  var cat = req.params.cat;
  var limit = 10;
  var skip = limit * parseInt(req.params.page);
  vendor.find({
    'tags': new RegExp('^' + tag, "i"),
    'area': new RegExp('^' + area + '$', "i"),
    'category': cat,
    'subCategory': subcat
  }).skip(skip).limit(limit).exec(function(err, data) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    data.forEach(function(doc) {
      asyncTasks.push(function(callback) {
        var bookmark = 0;
        var vendorId = doc['_id'].toString();
        bookmarkUsers.find({
          bookmarkUserId: req.user._id
        }).distinct('bookmarkVendorId', function(err,
          bookmarkvendorIds) {
          comment.find({
            vendorId: vendorId
          }, function(err, result) {
            if (err) {
              return res.status(400).send({
                message: errorHandler
                  .getErrorMessage(
                    err)
              });
            }
            var totalRating = 0;
            for (var i = 0; i < result.length; i++)
              totalRating += result[i].commentRating;
            if (totalRating > 0)
              totalRating = totalRating / result.length;
            var temp = [];
            for (var i = 0; i < bookmarkvendorIds.length; i++)
              temp.push(bookmarkvendorIds[i].toString())
            if (_.includes(temp, doc['_id'].toString()))
              bookmark = 1;
            // var q = bookmarkvendorIds.indexOf(doc['_id'])
            var obj = new Object({
              _id: doc['_id'],
              name: doc['name'],
              contact: doc['contact'],
              category: doc['category'],
              subCategory: doc[
                'subCategory'],
              address: doc['address'],
              area: doc['area'],
              latitude: doc['latitude'],
              longitude: doc['longitude'],
              closingTiming: doc[
                'closingTiming'],
              openingTiming: doc[
                'openingTiming'],
              imageUrl: doc['imageUrl'],
              saveTime: doc['saveTime'],
              multiTime: doc['multiTime'],
              others: doc['others'],
              tags: doc['tags'],
              coords: doc['coords'],
              homeDelivery: doc[
                'homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: data['bookmark']
            });
            finalresult.push(obj);
            callback(err, obj);
          });
        });
      });
    });
    async.parallel(asyncTasks, function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler
            .getErrorMessage(
              err)
        });
      }
      res.json({
        error: false,
        data: finalresult
      });
    });
  });
}

exports.addContactHistory = function(req, res) {
  var contactHistoryData = new contactHistory({
    contactCallUserId: req.user._id,
    contactCallVendorId: req.params.vendorId,
    contactNumber: req.params.number,
    contactCallUserName: req.user.name,
    contactCallTime: new Date().getTime()
  });

  contactHistoryData.save(contactHistoryData, function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    res.json({
      error: false,
      data: 'successfully inserted'
    });
  });
}

exports.getContactHistory = function(req, res) {
  var asyncTasks = [];
  var finalResult = [];
  console.log(req.user._id);

  contactHistory.aggregate([{
    $match: {
      contactCallUserId: req.user._id
    }
  }, {
    "$unwind": "$contactCallTime"
  }, {
    $group: {
      _id: {
        'contactCallVendorId': "$contactCallVendorId"
      },
      contactCallTime: {
        "$addToSet": "$contactCallTime"
      }
    }
  }, {
    "$unwind": "$contactCallTime"
  }, {
    "$sort": {
      "contactCallTime": -1
    }
  }, {
    $group: {
      _id: {
        'contactCallVendorId': "$_id"
      },
      dups: {
        "$push": "$contactCallTime"
      }
    }
  }], function(err, docs) {
    console.log('docs : ', docs);
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    var midnighttime = (+d);
    console.log('midnighttime : ', midnighttime);
    console.log('error : ', err);
    async.forEach(docs, function(doc, callback) {
      console.log('doc : ', doc._id.contactCallVendorId);
      vendor.find({
        _id: doc._id.contactCallVendorId.contactCallVendorId
      }, function(err, vendor) {
        if (err) {
          return res.status(400).send({
            message: errorHandler
              .getErrorMessage(
                err)
          });
        }
        var result = new Object({
          vendorDetail: vendor,
          timing: doc.dups
        });
        finalResult.push(result);
        callback(null, finalResult);
      });

    }, function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler
            .getErrorMessage(
              err)
        });
      }
      res.json({
        error: false,
        data: finalResult
      });
    });
  });
}

exports.addNewVendor = function(req, res) {
  var bucket_name = 'chiblee';
  var filename = new Date().getTime() + ".jpg";
  console.log(filename);
  var image_url = "https://s3-ap-southeast-1.amazonaws.com/chiblee/" +
    filename;

  var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, './')
    },
    filename: function(req, file, callback) {
      callback(null, filename)
    }
  });
  var uploadfile = multer({
    storage: storage,
    size: 1080 * 10 * 10 * 10
  }).single('file');
  uploadfile(req, res, function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    } else {
      var readStream = fs.createReadStream('./' +
        filename);

      s3Upload(readStream, filename, res);
      var remark = '';
      if (!req.body.remarks)
        remark = req.body.remarks;

      var multitime = false;
      if (req.body.multiTime)
        multitime = Boolean(req.body.multiTime);
      var homeDelivery = Boolean(req.body.homeDelivery);

      var vendordata = new Object({
        "multiTime": multitime,
        "latitude": parseFloat(req.body.latitude, 10),
        "longitude": parseFloat(req.body.longitude, 10),
        "coords": [parseFloat(req.body.longitude, 10), parseFloat(
          req
          .body.latitude, 10)],
        "contact": req.body.contact,
        "subCategory": req.body.subCategory,
        "category": req.body.category,
        "remarks": req.body.remarks,
        "name": req.body.name,
        "address": req.body.address,
        "openingTiming": req.body.openingTiming,
        "closingTiming": req.body.closingTiming,
        "imageUrl": image_url,
        "area": req.body.area,
        "shopNo": req.body.shopNo,
        "landmark": req.body.landmark,
        "homeDelivery": homeDelivery,
        "status": 0,
        "tags": req.body.tags,
        "userId": req.user._id,
        "saveTime": new Date().getTime(),
        "bookmark": 0,
        "others": ''
      });
      db.collection('addedvendors').update({}, {
          '$set': vendordata
        }, {
          upsert: true
        },
        function(err, data) {
          if (err) {
            return res.status(400).send({
              message: errorHandler
                .getErrorMessage(
                  err)
            });
          }
          res.json({
            "error": false,
            "result": "successfully inserted"
          });
        });
    }
  });
};

var s3Upload = function(readStream, fileName, res) {
  var bucket_name = 'chiblee';
  var s3 = new AWS.S3({
    region: 'ap-southeast-1',
    apiVersion: '2010-03-31',
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  });
  var params = {
    Bucket: bucket_name,
    Key: fileName,
    ACL: 'public-read',
    Body: readStream
  };
  s3.putObject(params, function(err, data) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    var filePath = './' + fileName;
    fs.unlinkSync(filePath);
  });
};


exports.getAddedNewVendor = function(req, res) {
  db.collection('addedvendors').find({
    userId: req.user._id
  }).toArray(function(err, docs) {
    console.log('docs : ', docs);
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    res.json({
      "error": false,
      "result": docs
    });
  });
}


exports.getUserComments = function(req, res) {
  var asyncTasks = [];
  var finalResult = [];
  var vendorId = new ObjectID(req.params.vendorId)
  comment.find({
    commentUserId: req.user._id
  }, function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    var totalRating = 0;
    for (var i = 0; i < result.length; i++)
      totalRating += result[i].commentRating;
    if (totalRating > 0)
      totalRating = totalRating / result.length;
    result.forEach(function(item) {
      asyncTasks.push(function(callback) {
        var now = (new Date).getTime();
        var then = item.commentTime;
        var diff = moment(moment(now).diff(then)).format(
          'DD:HH:mm:ss');
        var date = diff.split(':');
        var day = 0;
        if (date[0] > 1)
          day = date[0];
        var hours = 0;
        if (date[1] > 0)
          hours = date[1];
        var minutes = 0;
        if (date[2] > 0)
          minutes = date[2];
        var second = 0;
        if (date[3] > 0)
          second = date[3];
        vendor.find({
          _id: item['vendorId']
        }).exec(function(err, docs) {
          var obj = new Object({
            _id: item['_id'],
            commentText: item['commentText'],
            commentUserId: item['commentUserId'],
            commentRating: item['commentRating'],
            vendorId: item['vendorId'],
            commentUserName: item['commentUserName'],
            commentUserImageUrl: item[
              'commentUserImageUrl'],
            commentTime: item['commentTime'],
            commentAddress: req.body.commentAddress,
            day: day,
            hours: hours,
            minutes: minutes,
            second: second,
            vendorDetail: docs
          });
          finalResult.push(obj)
          callback();
        });
      });
    });
    async.parallel(asyncTasks, function() {
      res.json({
        error: false,
        data: {
          result: finalResult,
          totalRating: totalRating
        }
      });
    });
  });
}


exports.deleteVendor = function(req, res) {
  var vendorId = new ObjectID(req.params.vendorId);
  db.collection('addedvendors').remove({
    '_id': vendorId
  }, function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json({
      error: false,
      data: 'successfully removed'
    });
  });
}

exports.convertExcelToJson = function(req, res) {
  console.log('here');
  xlsxj({
      input: path.resolve(__dirname, 'Rahul 6.xlsx'),
      output: './output6.json'
    },
    function(err, result) {
      if (err) {
        console.error(err);
      } else {
        console.log(result);
      }
    });
}


exports.temp = function(req, res) {
  var q = 0;
  var data = {};
  var data1 = [];

  var JSONStream = require('JSONStream');

  var stream = fs.createReadStream(path.resolve(__dirname, 'new.json'), {
      encoding: 'utf8'
    }),
    parser = JSONStream.parse();

  stream.pipe(parser);

  parser.on('data', function(obj) {
    console.log(obj); // whatever you will do with each JSON object
    console.log(obj.length);
    for (var i = 0; i < obj.length; i++)
    // console.log('object[i] : ', obj[i]);
      data1.push(obj[i].address);
  });
  parser.on('end', function(item) {
    console.log('data 1 : ', data1);
    console.log('end'); // whatever you will do with each JSON object
    // data1.push(obj.address);
  });
  // console.log('data : ', data1);
}
