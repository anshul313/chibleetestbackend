var app = require('../../../../config/lib/app.js');
var db = app.db();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var vendor = mongoose.model('cleanvendor');
var vendordetail = mongoose.model('vendorDetail');

exports.cleanVendorList = function(req, res) {
  console.log('session email in vendor  : ', req.session.email);
  console.log(req.query);
  var skip = parseInt(req.query.page) - 1,
    limit = parseInt(req.query.limit),
    fieldName = req.query.name,
    order = {
      fieldName: 1
    };
  db.collection('cleanvendors').count({}, function(error, count) {
    db.collection('cleanvendors').find({}, {
      _id: 0,
      serialnumber: 0,
      area: 0,
      imageUrl: 0,
      saveTime: 0,
      multiTime: 0,
      others: 0,
      tags: 0,
      coords: 0,
      remarks: 0,
      shopNo: 0,
      city: 0,
      keyword: 0,
      night: 0,
      offDays: 0,
      speciality: 0,
      isWalletInterested: 0,
      isMobile: 0,
      isStationary: 0,
      gcmId: 0,
      bookmark: 0,
      homeDelivery: 0,
      __v: 0,
      latitude: 0,
      longitude: 0,
      status: 0,
      isActive: 0
    }).skip(skip).limit(limit).sort(order).toArray(function(err, result) {
      res.json({
        'count': count,
        'data': result
      });
    });
  });
}

exports.vendorList = function(req, res) {
  var skip = parseInt(req.query.page) - 1,
    limit = parseInt(req.query.limit),
    fieldName = req.query.name,
    order = {
      fieldName: 1
    };

  db.collection('vendordetails').count({}, function(error, count) {
    db.collection('vendordetails').find({}, {
      isActive: 1,
      offDays: 1,
      speciality: 1,
      isHomeDelivery: 1,
      name: 1,
      toTiming: 1,
      fromTiming: 1,
      address: 1,
      shopNumber: 1,
      isWalletInterested: 1,
      isMobile: 1,
      isStationary: 1,
      category: 1,
      model: 1,
      paytmNumber: 1,
      mobileNumber: 1,
      email: 1
    }).skip(skip).limit(limit).sort(order).toArray(function(err, result) {
      res.json({
        'count': count,
        'data': result
      });
    });
  });
}

exports.vendorDetailsById = function(req, res) {
  db.collection('vendordetails').find({
    _id: new mongo.ObjectID(req.query.objId)
  }).toArray(function(err, result) {
    res.json(result[0]);
  });
}

exports.confirmVendor = function(req, res) {
  var coordinate = [];
  coordinate.push(req.body.latitude);
  coordinate.push(req.body.longitude);

  var vendorData = new vendor({
    serialnumber: req.body._id,
    name: req.body.name,
    contact: req.body.mobileNumber,
    category: req.body.category,
    subCategory: req.body.subCategory,
    address: req.body.address,
    area: req.body.area,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    openingTiming: req.body.fromTiming,
    closingTiming: req.body.toTiming,
    imageUrl: '-',
    saveTime: new Date().getTime(),
    multiTime: req.body.multiTime,
    others: '',
    tags: req.body.tags,
    coords: coordinate,
    homeDelivery: req.body.isHomeDelivery,
    remarks: req.body.remarks,
    shopNo: '',
    city: req.body.landmark,
    status: 1,
    keyword: req.body.keyword,
    night: false
  });
  var query = {
    serialnumber: req.body._id
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
        vendordetail.update({
          _id: req.body._id
        }, {
          isActive: true
        }, function(err2, docs1) {
          if (err1) {
            console.log('error2 : ', err2);
          }
          res.json({
            message: 'succesfully updated'
          });
        });
      });
    }
  });
}
