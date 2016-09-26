'use strict';

/* global Set b:true */

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  vendor = mongoose.model('cleanvendor'),
  comment = mongoose.model('vendorcomments'),
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
var MongoClient = require("mongodb").MongoClient;
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

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

exports.getvendor = function(req, res) {
  console.log('start ......');
  vendor.find({
    coords: {
      $nearSphere: [parseFloat(req.body.lat), parseFloat(req.body.lng)],
      $minDistance: 0,
      $maxDistance: req.body.radius,
    },
    category: req.body.cat,
    subCategory: req.body.subcat
  }).skip(req.body.page * 10).limit(10).exec(function(err, data) {
    if (err)
      console.log('error : ', err);
    res.json({
      error: false,
      data: data
    });
  });
}

exports.getelasticsearchbylatlng = function(req, res) {
  var inp = req.params.input;
  var lat = req.params.lat;
  var lon = req.params.lon;
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
              "fields": ["category"],
              "type": "phrase_prefix"
            }
          },
          filter: {
            geo_distance: {
              distance: "5km",
              coords: [
                77.2823415,
                28.6713119
              ]
            }
          }
        }

      }
    }
  }).then(function(resp) {
    console.log('Response : ', resp);
  }, function(err) {
    console.log('Error : ', err);
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
  var q = 0;
  var count = 1;
  var fs = require('fs');
  var JSONStream = require('JSONStream');
  var es = require('event-stream');

  // for (var k = 0; k < 1; k++) {
  //   console.log('K : ', k);
  var fileStream = fs.createReadStream(
    path.resolve(__dirname, 'data.json'), {
      encoding: 'utf8'
    });
  fileStream.pipe(JSONStream.parse('*')).pipe(es.through(function(
    data) {
    // console.log('printing one customer object read from file ::');
    // console.log(data, "   : ", ++i);
    this.pause();
    processOneCustomer(data, this);
    return data;
  }), function end() {
    console.log('stream reading ended');
    this.emit('end');
  });

  function processOneCustomer(data, es) {
    console.log(data.length);
    for (i = 0; i < data.length; i++) {
      // console.log(data[i]['Name of vendor']);
      // console.log(data[i]['Contact']);
      // console.log(data[i]['Category']);
      // console.log(data[i]['Sub-category']);
      var add = data[i]['Address'];
      if (add === "") {
        add = data[i]['Address_raw'];
      }
      if (data[i]['Latitude'] === "-")
        data[i]['Latitude'] = 0;
      if (data[i]['Longitude'] === "-")
        data[i]['Longitude'] = 0;
      // console.log(data[i]['Location']);
      // console.log(data[i]['Latitude']);
      // console.log(data[i]['Longitude']);
      // console.log(data[i]['Open_timing']);
      // console.log(data[i]['Image']);
      // console.log(data[i]['Others_raw']);
      // console.log('Home Delivery : ', data[i]['Home Delivery?']);
      // console.log('remarsks : ', data[i]['Remark_raw']);
      var tags = data[i]['Tags'].split(',');
      // console.log('tags : ', tags);
      var coordinate = [];
      coordinate.push(data[i]['Longitude']);
      coordinate.push(data[i]['Latitude']);
      var homeDelivery = false;
      if (data[i]['Home Delivery?'] != "NO") {
        homeDelivery = true;
      }
      var bookmark = false;
      if (req.body.bookmark)
        bookmark = req.body.bookmark;

      var rating = 0;
      if (req.body.rating)
        rating = req.body.rating;
      // var tag1 = data[i]['Others_raw'].split(",");
      // for (var i = 0; i < tags.length; i++)
      //   tags.push(tag1[i]);


      var vendorData = {
        name: data[i]['Name of vendor'],
        contact: data[i]['Contact'],
        category: data[i]['Category'],
        subCategory: data[i]['Sub-category'],
        address: add,
        area: data[i]['Location'],
        latitude: data[i]['Latitude'],
        longitude: data[i]['Longitude'],
        openingTiming: data[i]['Open_timing'],
        closingTiming: data[i]['Close_timing'],
        image: data[i]['Image'],
        saveTime: Date.now(),
        multiTime: data[i]['Multi'],
        others: data[i]['Others_raw'],
        tags: tags,
        coords: coordinate,
        homeDelivery: homeDelivery,
      };

      var query = {
        latitude: data[i]['Latitude'],
        longitude: data[i]['Longitude']
      };


      client.index({
        index: 'cleanvendors',
        type: 'Document',
        id: ++q,
        body: vendorData
      }, function(error, response) {
        console.log('index created');
      });



      // vendor.findOneAndUpdate(query, vendorData, {
      //   upsert: true
      // }, function(err, doc) {
      //   if (err) return res.send(500, {
      //     error: err
      //   });
      //   // return res.send("succesfully saved");
      //   console.log("succesfully saved");
      // });

      //   if (data[i].results.length > 0) {
      //     // console.log("lat", data[i].results[0].geometry.location.lat);
      //     // console.log("lng", data[i].results[0].geometry.location.lng);
      //     for (var j = 0; j < data[i].results.length; j++) {
      //
      //       var vicinityArea = data[i].results[j].vicinity.split(",");
      //       if (vicinityArea.length > 2) {
      //         var area = vicinityArea[vicinityArea.length - 2];
      //       } else {
      //         var area = data[i].results[j].vicinity;
      //       }
      //       var vendorData = new Object({
      //         "latitude": data[i].results[j].geometry.location.lat,
      //         "longitude": data[i].results[j].geometry.location.lng,
      //         "placeId": data[i].results[j].place_id,
      //         "area": area,
      //         "category": "Owl",
      //         "subCategory": "ATM",
      //         "name": data[i].results[j].name,
      //         "homeDelivery": "No",
      //         "remarks": "-",
      //         "open": "24x7",
      //         "close": "-",
      //         "multipleTiming": "NA",
      //         "contactNo": "-",
      //         "address": data[i].results[j].vicinity,
      //         "tag": ["ATM"],
      //         "image": data[i].results[j].icon,
      //         "type": data[i].results[j].types,
      //         "time": Date.now(),
      //         "uploadtime": Date.now(),
      //         "status": "live",
      //         "username": data[i].results[j].scope
      //       });
      //     }
      //   }
    }
  }
  // res.send('successfully insetred');
  // }
}

exports.addcomment = function(req, res) {
  var vendorId = new ObjectID(req.body.vendorId);
  var newcomment = {
    commentText: req.body.commentText,
    commentRating: req.body.commentRating,
    commentUserId: req.user._id,
    vendorId: vendorId,
    commentUserName: req.user.name,
    commentTime: parseInt(moment().format('x'))
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
    totalRating = totalRating / result.length;
    if (totalRating == null)
      totalRating = 0;
    res.json({
      error: false,
      data: {
        result: result,
        totalRating: totalRating
      }
    });
  });
}

exports.getVendorsByRating = function(req, res) {
  var vendorIds = [];
  var i = 0;
  comment.aggregate([{
    "$match": {
      "category": req.body.category,
      "subCategory": req.body.subCategory,
    }
  }, {
    $group: {
      "_id": "$vendorId",
      "commentRating": {
        $sum: '$commentRating'
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
    console.log('document : ', docs);
    if (err) {
      return res.status(400).send({
        message: errorHandler
          .getErrorMessage(
            err)
      });
    }
    docs.forEach(function(doc) {
      i++;
      var verdorID = new ObjectID(doc['_id']);
      vendor.findOne({
        _id: verdorID
      }, function(err, data) {
        console.log(data);
        vendorIds.push(data);
        if (vendorIds.length == i) {
          res.json({
            error: false,
            data: vendorIds
          });
        }
      });
    });
  });
}



exports.addNewVendor = function(req, res) {
  var bucket_name = 'chiblee';
  var fileName = '';
  var vendor_name = req.query.vendor_name;
  var vendor_lat = parseInt(req.query.vendor_lat, 10);
  var filename = vendor_name + vendor_lat + ".jpg";
  // console.log('filename : ', filename);
  var image_url = "https://s3-ap-southeast-1.amazonaws.com/chiblee/" +
    filename;

  var vendordata = new Object({
    "others": req.query.vendor_others,
    "multi": req.query.vendor_multi,
    "lat": parseFloat(req.query.vendor_lat, 10),
    "lon": parseFloat(req.query.vendor_lon, 10),
    "subcategory": req.query.vendor_subcategory,
    "remarks": req.query.vendor_remarks,
    "name": req.query.vendor_name,
    "address": req.query.vendor_address,
    "phone": req.query.vendor_phone,
    "open_timing": req.query.vendor_open_timing,
    "close_timing": req.query.vendor_close_timing,
    "image": image_url,
    "time": req.query.time,
    "user_name": req.query.user_name,
    "area": req.query.vendor_area,
    "home": req.query.vendor_home,
    'uploadTime': Date.now(),
    "status": "Pending",
    "type": req.query.vendor_type
  });

  var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, os.tmpdir())
    },
    filename: function(req, file, callback) {
      fileName = filename;
      callback(null, fileName)
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
      var readStream = fs.createReadStream(os.tmpdir() + '/' +
        filename);

      s3Upload(readStream, filename, res);
      db.collection('chibleevendors').update({}, {
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
            "result": "Data Saved For Reviewing"
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
    // ACL: 'public-read',
    Body: readStream
  };
  s3.putObject(params, function(err, data) {
    if (err)
      res.send(err);
  });
};
