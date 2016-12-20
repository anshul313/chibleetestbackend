var app = require('../../../../config/lib/app.js');
var db = app.db();
var mongo = require('mongodb');



exports.cleanVendorList = function(req, res) {
    console.log('session email in vendor  : ', req.session.email);
    console.log(req.query);
    var skip = parseInt(req.query.page) - 1,
        limit = parseInt(req.query.limit),
        fieldName = req.query.name,
        order = { fieldName: 1 };
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
            res.json({ 'count': count, 'data': result });
        });
    });
}

exports.vendorList = function(req, res) {
    var skip = parseInt(req.query.page) - 1,
        limit = parseInt(req.query.limit),
        fieldName = req.query.name,
        order = { fieldName: 1 };

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
            res.json({ 'count': count, 'data': result });
        });
    });
}

exports.vendorDetailsById = function(req, res) {
    db.collection('vendordetails').find({ _id: new mongo.ObjectID(req.query.objId) }).toArray(function(err, result) {
        res.json(result[0]);
    });
}