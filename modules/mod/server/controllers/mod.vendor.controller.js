var app = require('../../../../config/lib/app.js');
var db = app.db();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var vendor = mongoose.model('cleanvendor');
var vendordetail = mongoose.model('vendorDetail');

exports.cleanVendorList = function(req, res) {
  var query = {};
  if (Object.keys(req.body).length && (req.body.name || req.body.contact ||
      req.body.category || req.body.subCategory || req.body.address)) {
    query["$and"] = [];
    if (req.body.name) {
      query["$and"].push({
        "name": new RegExp(req.body.name, "i")
      });
    }
    if (req.body.contact) {
      query["$and"].push({
        "contact": new RegExp(req.body.contact, "i")
      });
    }
    if (req.body.category) {
      query["$and"].push({
        "category": new RegExp(req.body.category, "i")
      });
    }
    if (req.body.subCategory) {
      query["$and"].push({
        "subCategory": new RegExp(req.body.subCategory, "i")
      });
    }
    if (req.body.address) {
      query["$and"].push({
        "address": new RegExp(req.body.address, "i")
      });
    }
  }
  var order = {};

  var skip = parseInt(req.query.page) - 1,
    limit = parseInt(req.query.limit);

  if (req.query.order.charAt(0) == "-") {
    order[req.query.order.substring(1)] = -1;
  } else {
    order[req.query.order] = 1;
  }

  db.collection('cleanvendors').count(query, function(error, count) {
    db.collection('cleanvendors').find(query, {
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
    contact: req.body.contact,
    category: req.body.category,
    subCategory: req.body.subCategory,
    address: req.body.address,
    area: req.body.area,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    openingTiming: req.body.fromTiming,
    closingTiming: req.body.toTiming,
    imageUrl: req.body.imageUrl,
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
    } else {
      res.json({
        message: 'vendor exists'
      });
    }
  });
}

exports.cleanVendorDetailsUpdateById = function(req, res) {
  var coordinate = [];
  coordinate.push(req.body.latitude);
  coordinate.push(req.body.longitude);

  var query = {
    _id: new mongo.ObjectID(req.body._id)
  };

  vendor.update(query, {
    '$set': {
      serialnumber: req.body.serialnumber,
      name: req.body.name,
      contact: req.body.contact,
      category: req.body.category,
      subCategory: req.body.subCategory,
      address: req.body.address,
      area: req.body.area,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      openingTiming: req.body.openingTiming,
      closingTiming: req.body.closingTiming,
      imageUrl: req.body.imageUrl,
      saveTime: new Date().getTime(),
      multiTime: req.body.multiTime,
      others: req.body.others,
      tags: req.body.tags[0],
      coords: coordinate,
      homeDelivery: req.body.homeDelivery,
      remarks: req.body.remarks,
      shopNo: req.body.shopNo,
      city: req.body.city,
      status: 1,
      keyword: req.body.keyword,
      night: req.body.night,
      platform: req.body.platform,
      isActive: req.body.isActive,
      offDays: req.body.offDays,
      speciality: req.body.speciality,
      isWalletInterested: req.body.isWalletInterested,
      isMobile: req.body.isMobile,
      isStationary: req.body.isStationary,
      gcmId: req.body.gcmId,
      bookmark: req.body.bookmark
    }
  }, function(err, docs) {
    if (err) {
      console.log('error : ', err);
    }
    res.json({
      message: 'succesfully updated'
    });
  });
}

exports.cleanVendorDetailsById = function(req, res) {
  db.collection('cleanvendors').find({
    _id: new mongo.ObjectID(req.query.objId)
  }).toArray(function(err, result) {
    // console.log('res ', result);
    res.json(result[0]);
  });
}
