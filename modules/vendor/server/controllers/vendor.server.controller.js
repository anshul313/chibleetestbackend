'use strict';

/* global Set b:true */

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  vendor = mongoose.model('cleanvendor'),
  contactHistory = mongoose.model('contactCallHistory'),
  banner = mongoose.model('bannerSchema'),
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
var JSONStream = require('JSONStream');
var es = require('event-stream');
var suggestTag = mongoose.model('tagschema');
var geolib = require('geolib');
var underscore = require('underscore');
var vendordetail = mongoose.model('vendorDetail');

exports.getvendors = function(req, res) {
  var finalresult = [];
  var asyncTasks = [];
  var coordinates = [parseFloat(req.body.lng), parseFloat(req.body.lat)];

  vendor.aggregate([{
    $geoNear: {
      near: {
        type: "Point",
        coordinates: coordinates
      },
      distanceField: "distance",
      minDistance: 0,
      maxDistance: 100000000,
      num: 10000000,
      query: {
        category: req.body.cat,
        subCategory: req.body.subcat
      },
      spherical: true
    }
  }, {
    $skip: (req.body.page * 40)
  }, {
    $limit: 40
  }], function(err, data) {
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

            var distanceinkm = geolib.getDistance({
              latitude: doc['latitude'],
              longitude: doc['longitude']
            }, {
              latitude: Number(req.body.lat),
              longitude: Number(req.body.lng)
            }) / 1000;
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
              homeDelivery: doc['homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: bookmark,
              serialnumber: doc['serialnumber'],
              keyword: doc['keyword'],
              distance: distanceinkm,
              gcmId: doc['gcmId']
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
            .getErrorMessage(err)
        });
      }
      var result = _.orderBy(finalresult, ['distance'], ['asc']);
      res.json({
        error: false,
        data: result
      });
    });
  });
}

exports.getOwlVendor = function(req, res) {
  var finalresult = [];
  var asyncTasks = [];
  var coordinates = [parseFloat(req.body.lng), parseFloat(req.body.lat)];

  vendor.aggregate([{
    $geoNear: {
      near: {
        type: "Point",
        coordinates: coordinates
      },
      distanceField: "distance",
      minDistance: 0,
      maxDistance: 100000000,
      num: 10000000,
      query: {
        category: 'Owl',
        subCategory: req.body.subcat,
        night: true
      },
      spherical: true
    }
  }, {
    $skip: (req.body.page * 40)
  }, {
    $limit: 40
  }], function(err, data) {
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

            var distanceinkm = geolib.getDistance({
              latitude: doc['latitude'],
              longitude: doc['longitude']
            }, {
              latitude: Number(req.body.lat),
              longitude: Number(req.body.lng)
            }) / 1000;
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
              homeDelivery: doc['homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: bookmark,
              serialnumber: doc['serialnumber'],
              keyword: doc['keyword'],
              distance: distanceinkm,
              night: doc['night'],
              gcmId: doc['gcmId']
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
            .getErrorMessage(err)
        });
      }
      var result = _.orderBy(finalresult, ['distance'], ['asc']);
      res.json({
        error: false,
        data: result
      });
    });
  });
}

exports.vendorByArea = function(req, res) {
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
              bookmark: data['bookmark'],
              serialnumber: data['serialnumber'],
              keyword: data['keyword'],
              gcmId: doc['gcmId']
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

exports.addvendor = function(req, res) {
  console.log('add vendor');
  var i = 0;
  var q = 37594;
  var count = 0;
  var asyncTasks = [];

  fs.readFile(path.resolve(__dirname,
      'json/Deepak.json'),
    'utf8',
    function(err, data) {
      var jsonData = JSON.parse(data);
      jsonData.forEach(function(doc) {
        // console.log('doc : ', doc);
        asyncTasks.push(function(callback) {

          if (doc['Latitude'] === "-")
            doc['Latitude'] = 0;
          if (doc['Longitude'] === "-")
            doc['Longitude'] = 0;

          // var tags = doc['tags'].split(',');
          var coordinate = [];
          coordinate.push(doc['Longitude']);
          coordinate.push(doc['Latitude']);
          var homeDelivery = false;
          if (doc['Home Delivery?'] != "No") {
            homeDelivery = true;
          }

          var multiTime = false;
          if (doc['Multi'] != "-") {
            multiTime = true;
          }
          var nightstatus = false;
          if (doc['night'] != "FALSE") {
            nightstatus = true;
          }

          count++;
          var vendorData = new vendor({
            serialnumber: doc['S.No.'],
            name: doc['Name of vendor'],
            contact: doc['Contact'].toString(),
            category: doc['Category'],
            subCategory: doc['Sub-category'],
            address: doc['Address_raw'],
            area: doc['Location'],
            latitude: doc['Latitude'],
            longitude: doc['Longitude'],
            openingTiming: doc['Open_timing'],
            closingTiming: doc['Close_timing'],
            imageUrl: doc['Image'],
            saveTime: new Date().getTime(),
            multiTime: multiTime,
            others: doc['Others_raw'],
            tags: doc['Tags'],
            coords: coordinate,
            homeDelivery: homeDelivery,
            remarks: doc['Remarks'],
            shopNo: '',
            city: doc['City'],
            status: 1,
            keyword: doc['Adword Keywords'],
            night: nightstatus
          });

          var query = {
            serialnumber: doc['S.No.']
          };
          vendor.findOne(query, function(err, docs) {
            if (err) {
              console.log('error : ', err);
            }
            if (!docs) {
              vendorData.save(function(err1, docs1) {
                if (err1) {
                  console.log('error1 : ', err1);
                }
                console.log("succesfully saved : ",
                  ++count);
              })
            } else {
              vendor.remove({
                _id: docs._id
              }, function(err2, docs1) {
                if (err2) {
                  console.log('error2 : ', err2);
                }
                vendorData.save(function(err3, docs1) {
                  if (err3) {
                    console.log('error3 : ', err3);
                  }
                  console.log("succesfully saved : ",
                    ++count);
                })
              })
            }
          });
        });
      });
      async.parallel(asyncTasks, function(err, result) {
        if (err) {
          return res.status(400).send({
            message: errorHandler
              .getErrorMessage(err)
          });
        }
      });
    });
}

exports.googleDataInsert = function(req, res) {
  var q = 103696;
  var count = 1;
  var l = 0;
  var asyncTasks = [];

  for (var k = 70; k < 97; k++) {
    fs.readFile(path.resolve(__dirname,
      'files/noida/PHARMACY/NoidaPHARMACY' +
      k + '.json'), 'utf8', function(err, data) {
      var jsonData = JSON.parse(data);
      jsonData['result'].forEach(function(doc) {

        asyncTasks.push(function(callback) {
          if (doc.results.length > 0) {
            for (var j = 0; j < doc.results.length; j++) {
              var vicinityArea = doc.results[j].vicinity.split(
                ",");
              if (vicinityArea.length > 2) {
                var area = vicinityArea[vicinityArea.length -
                  2];
              } else {
                var area = doc.results[j].vicinity;
              }

              var coordinate = [];
              coordinate.push(doc.results[j].geometry.location
                .lng);
              coordinate.push(doc.results[j].geometry.location
                .lat);
              var tag = '';
              for (var temp = 0; temp < doc.results[j].types
                .length; temp++) {
                if (temp === doc.results[j].types.length -
                  1)
                  tag = tag + doc.results[j].types[temp];
                else
                  tag = tag + doc.results[j].types[temp] +
                  ', ';
              }

              var vendorData = new Object({
                serialnumber: doc.results[j].id,
                name: doc.results[j].name,
                contact: '',
                category: 'Health',
                subCategory: 'Pharmacy',
                address: doc.results[j].vicinity,
                area: area,
                latitude: doc.results[j].geometry.location
                  .lat,
                longitude: doc.results[j].geometry.location
                  .lng,
                openingTiming: '1 am',
                closingTiming: '12 pm',
                imageUrl: doc.results[j].icon,
                saveTime: new Date().getTime(),
                multiTime: false,
                others: '-',
                tags: tag,
                coords: coordinate,
                homeDelivery: false,
                remarks: '-',
                shopNo: '',
                landMark: doc.results[j].vicinity,
                status: 1,
                keyword: tag
              });

              vendor.findOneAndUpdate({
                serialnumber: doc.results[j].id
              }, vendorData, {
                upsert: true
              }, function(err, doc) {
                if (err) {
                  console.log('error : ', err);
                }
                console.log('insert successfully : ',
                  count++);
              });
            }
          }
        });
      });

      async.parallel(asyncTasks, function(err, result) {
        if (err) {
          return res.status(400).send({
            message: errorHandler
              .getErrorMessage(err)
          });
        }
      });
    });
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
    vendorId: vendorId
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
  }).sort({
    commentTime: -1
  }).find(function(err, result) {
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
      var ascending = underscore.sortBy(finalResult, 'commentTime');
      finalResult = ascending.reverse();
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
                  longitude: data[
                    'longitude'],
                  closingTiming: data[
                    'closingTiming'],
                  openingTiming: data[
                    'openingTiming'],
                  imageUrl: data['imageUrl'],
                  saveTime: data['saveTime'],
                  multiTime: data[
                    'multiTime'],
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
                  bookmark: data['bookmark'],
                  serialnumber: data[
                    'serialnumber'],
                  keyword: data['keyword']
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
              bookmark: data['bookmark'],
              serialnumber: data[
                'serialnumber'],
              keyword: data['keyword']
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
            bookmark: data['bookmark'],
            serialnumber: data[
              'serialnumber'],
            keyword: data['keyword']
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

exports.getBookMark = function(req, res) {
  var finalresult = [];
  var asyncTasks = [];
  var limit = 10;
  var skip = limit * parseInt(req.params.page);
  bookmarkUsers.find({
    bookmarkUserId: req.user._id
  }).distinct('bookmarkVendorId', function(err, bookmarkvendorIds) {
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

            var distance = geolib.getDistance({
              latitude: parseFloat(req.query.lat),
              longitude: parseFloat(req.query.lng)
            }, {
              latitude: parseFloat(doc['latitude']),
              longitude: parseFloat(doc['longitude'])
            });
            var distance = distance / 1000;

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
              bookmark: 1,
              serialnumber: doc['serialnumber'],
              keyword: data['keyword'],
              distance: distance
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
        var result = _.orderBy(finalresult, ['distance'], ['asc']);
        res.json({
          error: false,
          data: result
        });
      });
    })
  });
}


exports.getsuggestion = function(req, res) {

  function removeDuplicates(arr, prop) {
    var new_arr = [];
    var lookup = {};

    for (var i in arr) {
      lookup[arr[i][prop]] = arr[i];
    }

    for (i in lookup) {
      new_arr.push(lookup[i]);
    }

    return new_arr;
  }

  suggestTag.find({
    'name': new RegExp('^' + req.params.inp, "i")
  }, {
    tags: 1,
    cat: 1,
    subcat: 1,
    name: 1,
    _id: 0
  }).exec(function(err, resp) {
    var uniqueArray = removeDuplicates(resp, "name");
    res.json({
      err: false,
      data: uniqueArray
    });
  });
}

exports.vendorByTags = function(req, res) {

  var finalresult = [];
  var asyncTasks = [];
  var coordinates = [parseFloat(req.body.lng), parseFloat(req.body.lat)];

  vendor.aggregate([{
    $geoNear: {
      near: {
        type: "Point",
        coordinates: coordinates
      },
      distanceField: "distance",
      maxDistance: 100000,
      query: {
        'tags': new RegExp(req.body.tag, "i"),
        'category': req.body.cat,
        'subCategory': req.body.subcat
      },
      spherical: true
    }
  }, {
    $skip: (req.body.page * 40)
  }, {
    $limit: 40
  }], function(err, data) {
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

            var distanceinkm = doc['distance'] /
              1000;
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
              homeDelivery: doc['homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: bookmark,
              serialnumber: doc['serialnumber'],
              keyword: doc['keyword'],
              distance: distanceinkm
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
            .getErrorMessage(err)
        });
      }
      var result = _.orderBy(finalresult, ['distance'], ['asc']);
      res.json({
        error: false,
        data: result
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
    // console.log('docs : ', docs);
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    var midnighttime = (+d);
    // console.log('midnighttime : ', midnighttime);
    // console.log('error : ', err);
    async.forEach(docs, function(doc, callback) {
      // console.log('doc : ', doc._id.contactCallVendorId);
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
      // console.log('finalResult : ', finalResult);
      res.json({
        error: false,
        data: finalResult
      });
    });
  });
}

exports.addNewVendor = function(req, res) {
  var bucket_name = 'chiblee';
  var filename = "";
  var image_url = '';
  var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, "./")
    },
    filename: function(req, file, callback) {
      console.log("file", file.originalname)
      filename = new Date().getTime() + ".png"
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
      if (filename == "") {
        console.log('filename1 : ', filename);
        var remark = '';
        if (!req.body.remarks)
          remark = req.body.remarks;

        var multitime = false;
        if (req.body.multiTime)
          multitime = Boolean(req.body.multiTime);
        var homeDelivery = Boolean(req.body.homeDelivery);

        var vendordata = new vendordetail({
          userId: req.body.userId,
          deviceID: req.body.deviceID,
          email: req.body.email,
          model: req.body.model,
          contact: req.body.mobileNumber,
          appVersion: req.body.appVersion,
          paytmNumber: req.body.paytmNumber,
          mobikwikNumber: req.body.mobikwikNumber,
          gcmId: req.body.gcmId,
          androidSdk: req.body.androidSdk,
          category: req.body.category,
          isStationary: req.body.isStationary,
          isMobile: req.body.isStationary,
          isWalletInterested: req.body.isWalletInterested,
          area: req.body.area,
          shopNumber: req.body.shopNumber,
          address: req.body.address,
          landmark: req.body.landmark,
          fromTiming: req.body.fromTiming,
          toTiming: req.body.toTiming,
          name: req.body.name,
          isHomeDelivery: req.body.isHomeDelivery,
          registerTime: new Date().getTime(),
          imageUrl: image_url,
          speciality: req.body.speciality,
          offDays: req.body.offDays,
          remarks: req.body.remarks,
          latitude: req.body.latitude,
          longitude: req.body.longitude
        });
        console.log('vendordata : ', vendordata);
        vendordetail.update({
            "userId": req.body.userId,
            "name": req.body.name
          }, vendordata, {
            upsert: true
          },
          function(err, data) {
            if (err) {
              console.log('error : ', err);
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
      } else {
        console.log('filename : ', filename);
        var readStream = fs.createReadStream('./' +
          filename);

        s3Upload(readStream, filename, req, res);
        var image_url =
          'https://s3-ap-southeast-1.amazonaws.com/chiblee/' +
          filename;
        var remark = '';
        if (!req.body.remarks)
          remark = req.body.remarks;

        var multitime = false;
        if (req.body.multiTime)
          multitime = Boolean(req.body.multiTime);
        var homeDelivery = Boolean(req.body.homeDelivery);

        var vendordata = new vendordetail({
          userId: req.body.userId,
          deviceID: req.body.deviceID,
          email: req.body.email,
          model: req.body.model,
          contact: req.body.mobileNumber,
          appVersion: req.body.appVersion,
          paytmNumber: req.body.paytmNumber,
          mobikwikNumber: req.body.mobikwikNumber,
          gcmId: req.body.gcmId,
          androidSdk: req.body.androidSdk,
          category: req.body.category,
          isStationary: req.body.isStationary,
          isMobile: req.body.isStationary,
          isWalletInterested: req.body.isWalletInterested,
          area: req.body.area,
          shopNumber: req.body.shopNumber,
          address: req.body.address,
          landmark: req.body.landmark,
          fromTiming: req.body.fromTiming,
          toTiming: req.body.toTiming,
          name: req.body.name,
          isHomeDelivery: req.body.isHomeDelivery,
          registerTime: new Date().getTime(),
          imageUrl: image_url,
          speciality: req.body.speciality,
          offDays: req.body.offDays,
          remarks: req.body.remarks,
          latitude: req.body.latitude,
          longitude: req.body.longitude
        });
        vendordetail.update({
            "userId": req.user._id,
            "name": req.body.name
          }, vendordata, {
            upsert: true
          },
          function(err, data) {
            if (err) {
              console.log('error : ', err);
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
    }
  });
}

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
  vendordetail.find({
    userId: req.user._id
  }).lean().exec(function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    var ascending = underscore.sortBy(docs, 'registerTime');
    var finalResult = ascending.reverse();
    res.json({
      "error": false,
      "result": finalResult
    });
  });
}


exports.getUserComments = function(req, res) {
  var asyncTasks = [];
  var finalResult = [];
  var vendorId = new ObjectID(req.params.vendorId)
  comment.find({
    commentUserId: req.user._id
  }).sort({
    commentTime: -1
  }).exec(function(err, result) {
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
      var ascending = underscore.sortBy(finalResult, 'commentTime');
      finalResult = ascending.reverse();
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
  vendordetail.remove({
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

exports.getBanner = function(req, res) {
  banner.find({}, function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json({
      error: false,
      data: docs
    });
  });
}

exports.addBanner = function(req, res) {
  var name = req.body.name;
  var imageurl = req.body.imageUrl;
  var bannerdata = new banner({
    name: name,
    imageUrl: imageurl
  });
  bannerdata.save(function(err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json({
      error: false,
      data: docs
    });
  });
}

exports.autosearch = function(req, res) {
  var asyncTasks = [];
  var count = 1;
  vendor.find({}).skip(req.query.page * 10000).limit(10000).exec(
    function(err,
      document) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      document.forEach(function(docs) {
        asyncTasks.push(function(callback) {
          var tags = [];
          var tag = docs.tags.split(',');
          for (var j = 0; j < tag.length; j++) {
            var trimtag = tag[j].trim()
            var uppertag = trimtag.toUpperCase();
            tags.push(uppertag);
          }
          for (var j = 0; j < tag.length; j++) {
            var data = new suggestTag({
              name: tags[j],
              tags: tags,
              cat: docs.category,
              subcat: docs.subCategory
            });
            suggestTag.findOneAndUpdate({
              name: data.name
            }, {
              '$set': data
            }, {
              upsert: true
            }, function(err, result) {
              if (err) {
                callback(err, true);
              }
              console.log("successfully inserted : ",
                count++);
              callback(null, true);
            });
          }
        });
      });
      async.parallel(asyncTasks, function(err, docs) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({
          message: 'done'
        });
      });
    });
}

function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1 / 180
  var radlat2 = Math.PI * lat2 / 180
  var theta = lon1 - lon2
  var radtheta = Math.PI * theta / 180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) *
    Math.cos(
      radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515
  if (unit == "K") {
    dist = dist * 1.609344
  }
  if (unit == "N") {
    dist = dist * 0.8684
  }
  return dist
}

exports.dataCorrect = function(req, res) {
  var q = 103696;
  var count = 1;
  var l = 0;
  var asyncTasks = [];
  for (var k = 1; k < 2; k++) {
    fs.readFile(path.resolve(__dirname,
      'files/data/1-10000/' +
      k + '.json'), 'utf8', function(err, data) {
      var jsonData = JSON.parse(data);
      console.log('doc : ', jsonData);
      jsonData.forEach(function(doc) {
        console.log('doc : ', doc);
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
              // var data1 = new Object({
              //   "address": doc.address,
              //   "lat": data.results[0].geometry.location.lat,
              //   "lng": data.results[0].geometry.location.lng
              // });
              console.log(doc.latitude);
              console.log(doc.longitude);

              var dist = distance(doc.latitude, doc.longitude,
                data.results[0].geometry.location.lat,
                data
                .results[0].geometry.location.lng,
                'K');
              if (dist < 3) {
                var vendorData = new object({
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
                  bookmark: doc['bookmark'],
                  serialnumber: doc['serialnumber'],
                  keyword: doc['keyword']
                });
              }

              vendor.findOneAndUpdate({
                serialnumber: doc.serialnumber
              }, vendorData, {
                upsert: true
              }, function(err, doc) {
                if (err) {
                  console.log('error : ', err);
                }
                console.log(
                  'insert successfully : ',
                  count++);
              });
              callback();
            }
          });
        });
      });
      async.parallel(asyncTasks, function() {
        res.send('success');
      });
    });
  }
}

exports.webvendorbytag = function(req, res) {
  var finalresult = [];
  var asyncTasks = [];
  var skip = (parseInt(req.query.page - 1) * 10);

  vendor.find({
    'tags': new RegExp(req.query.search, "i")
  }).skip(skip).limit(10).exec(function(err, data) {
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

            var distanceinkm = doc['distance'] /
              1000;
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
              homeDelivery: doc['homeDelivery'],
              remarks: doc['remarks'],
              shopNo: '',
              landmark: doc['landmark'],
              status: doc['status'],
              rating: totalRating,
              bookmark: bookmark,
              serialnumber: doc['serialnumber'],
              keyword: doc['keyword'],
              distance: distanceinkm
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
            .getErrorMessage(err)
        });
      }
      vendor.find({
        'tags': new RegExp(req.query.search, "i")
      }).count(function(err, count) {
        res.json({
          error: false,
          data: finalresult,
          totalCount: count
        });
      });
    });
  });
}


exports.commentEdit = function(req, res) {
  var commentId = new ObjectID(req.body.commentid);

  comment.findOne({
    _id: commentId
  }, function(err, data) {
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(err)
      });
    }
    var vendorId = new ObjectID(data.vendorId);

    var milliseconds = (new Date).getTime();

    var newcomment = {
      commentText: req.body.commentText,
      commentRating: req.body.commentRating,
      commentUserId: data.commentUserId,
      vendorId: vendorId,
      commentAddress: data.commentAddress,
      commentUserName: data.commentUserName,
      commentUserImageUrl: data.commentUserImageUrl,
      commentTime: milliseconds
    };

    comment.update({
      _id: commentId,
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
        data: 'successfully updated'
      });
    });
  });
}

exports.commentRemove = function(req, res) {
  var commentId = new ObjectID(req.query.commentid);
  comment.remove({
    _id: commentId,
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
      data: 'successfully removed'
    });
  });
}
