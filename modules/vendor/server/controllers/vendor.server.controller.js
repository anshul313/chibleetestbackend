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
              bookmark: bookmark,
              serialnumber: doc['serialnumber'],
              keyword: doc['keyword']
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
              bookmark: data['bookmark'],
              serialnumber: data['serialnumber'],
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


exports.getelasticsearchbylatlng = function(req, res) {
  var coordinates = [77.15911, 28.7197545];
  db.collection('cleanvendor').find({
    // coords: {
    //   $nearSphere: {
    //     $geometry: {
    //       type: "Point",
    //       coordinates: [77.15911, 28.7197545]
    //     },
    //     $minDistance: 0,
    //     $maxDistance: 5000,
    //     distanceMultiplier: 3963.2
    //   }
    // }
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
  var q = 37594;
  var count = 1;

  var stream = fs.createReadStream(path.resolve(__dirname, 'output5.json'), {
      encoding: 'utf8'
    }),
    parser = JSONStream.parse();

  stream.pipe(parser);

  parser.on('data', function(data) {
    for (i = 0; i < data.length; i++) {
      var add = data[i]['Address'];
      if (add === "") {
        add = data[i]['Address_raw'];
      }
      if (data[i]['Latitude'] === "-")
        data[i]['Latitude'] = 0;
      if (data[i]['Longitude'] === "-")
        data[i]['Longitude'] = 0;

      var tags = data[i]['Tags'].split(',');
      var coordinate = [];
      coordinate.push(data[i]['Longitude']);
      coordinate.push(data[i]['Latitude']);
      var homeDelivery = false;
      if (data[i]['Home Delivery?'] != "No") {
        homeDelivery = true;
      }


      // var vendorContact = ;

      var vendorData = new vendor({
        serialnumber: data[i]['S.No.'],
        name: data[i]['Name of vendor'],
        contact: data[i]['Contact'].toString(),
        category: data[i]['Category'],
        subCategory: data[i]['Sub-category'],
        address: add,
        area: data[i]['Location'],
        latitude: data[i]['Latitude'],
        longitude: data[i]['Longitude'],
        openingTiming: data[i]['Open_timing'],
        closingTiming: data[i]['Close_timing'],
        imageUrl: data[i]['Image'],
        saveTime: new Date().getTime(),
        multiTime: data[i]['Multi'],
        others: data[i]['Others_raw'],
        tags: data[i]['Tags'],
        coords: coordinate,
        homeDelivery: homeDelivery,
        remarks: data[i]['Remarks'],
        shopNo: '',
        landMark: add,
        status: 1,
        keyword: data[i]['TAGS']
      });

      var query = {
        serialnumber: data[i]['S.No.']
      };

      client.index({
        index: 'cleanvendors',
        type: 'Document',
        id: ++q,
        body: vendorData
      }, function(error, response) {
        console.log('index created');
      });

      vendor.findOne(query, function(err, doc) {
        if (err) {
          console.log('error : ', err);
        }
        if (!doc) {
          vendorData.save(function(err1, docs1) {
            if (err1) {
              console.log('error : ', err);
            }
            console.log("succesfully saved : ", count++);
          })
        }
      });

    }
  });
  parser.on('end', function(item) {
    console.log('data 1 : ', q);
    console.log('end'); // whatever you will do with each JSON object
  });

}

exports.googleDataInsert = function(req, res) {

  var q = 103696;
  var count = 1;
  var l = 0;
  var asyncTasks = [];

  for (var k = 1; k < 31; k++) {

    fs.readFile(path.resolve(__dirname,
      'Gaziabad/Sheet2/GAS STATION/GaziabadGAS' +
      k + '.json'), 'utf8', function(err, data) {

      var jsonData = JSON.parse(data);
      jsonData['result'].forEach(function(doc) {

        asyncTasks.push(function(callback) {

          if (doc.results.length > 0) {
            for (var j = 0; j < doc.results.length; j++) {
              var vicinityArea = doc.results[j].vicinity.split(
                ",");
              if (vicinityArea.length > 2) {
                var area = vicinityArea[vicinityArea.length - 2];
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
                category: 'Misc',
                subCategory: 'Petrol Pump',
                address: doc.results[j].vicinity,
                area: area,
                latitude: doc.results[j].geometry.location
                  .lat,
                longitude: doc.results[j].geometry.location
                  .lng,
                openingTiming: '0',
                closingTiming: '24',
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
                // client.index({
                //   index: 'cleanvendors',
                //   type: 'Document',
                //   id: ++q,
                //   body: vendorData
                // }, function(error, response) {
                //   console.log('index created');
                // });
                console.log('insert successfully : ', count++);
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
              bookmark: 1,
              serialnumber: doc['serialnumber'],
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

  vendor.find({
    'tags': new RegExp('^' + req.params.inp, "i")
  }, {
    tags: 1,
    category: 1,
    subCategory: 1,
    area: 1,
    _id: 0
  }).exec(function(err, resp) {

    var uniqueArray = removeDuplicates(resp, "tags");
    res.json({
      err: false,
      data: uniqueArray
    });
  });
}

exports.vendorByTags = function(req, res) {
  var finalresult = [];
  var asyncTasks = [];
  var subcat = req.params.subcat;
  var tag = req.params.tag;
  var area = req.params.area;
  var cat = req.params.cat;
  var limit = 10;
  var skip = limit * parseInt(req.params.page);
  vendor.find({
    'tags': new RegExp(tag, "i"),
    'area': new RegExp(area, "i"),
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
              bookmark: data['bookmark'],
              serialnumber: data['serialnumber'],
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
        "coords": [parseFloat(req.body.longitude, 10),
          parseFloat(
            req
            .body.latitude, 10)
        ],
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
        "others": '-',
        "keyword": req.body.tags
      });
      db.collection('addedvendors').update({
          "userId": req.user._id,
          "name": req.body.name
        }, {
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
