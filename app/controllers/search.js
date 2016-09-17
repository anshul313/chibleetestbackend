var request = require('request');
var mongoose = require("mongoose");
require('../models/user');
var async = require('async');
var os = require('os');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var config = require('config');
var elasticsearch = require('elasticsearch');
var es = elasticsearch.Client({
  hosts: '52.77.1.79:9200'
});

var response = {
  error: false,
  status: 200,
  userMessage: '',
  errors: null,
  data: null,
};

var NullResponseValue = function() {
  response = {
    error: false,
    status: 200,
    userMessage: '',
    errors: null,
    data: null,
  };
  return true;
};

var SendResponse = function(res) {
  res.status(response.status);
  res.send(response);
  NullResponseValue();
};

/*===========================================
***   Services  ***
=============================================*/
var methods = {};
module.exports.controller = function(router) {

  router
    .route('/search/:lat/:lon/:input/:page')
    .get(methods.search);
  router
    .route('/search/:area/:input/:page')
    .get(methods.searchByArea)

}

/*===========================================
***  End Services  ***
=============================================*/


/*===========================================================
    *** Launch Service  ***
    =============================================================*/

methods.search = function(req, res) {
  var inp = req.params.input;
  var lat = req.params.lat;
  var lon = req.params.lon;
  var page = req.params.page;

  es.search({
    index: 'chiblee',
    size: 10,
    from: 10 * (page - 1),
    body: {
      query: {
        filtered: {
          query: {
            multi_match: {
              "query": inp,
              "fields": ["type", "type1", "name"],
              "type": "phrase_prefix"
            }
          },
          filter: {
            geo_distance: {
              distance: "8km",
              location: [
                parseFloat(lon),
                parseFloat(lat)
              ]
            }
          }
        }

      }
    }
  }).then(function(resp) {
    response.error = false;
    response.status = 200;
    response.userMessage = "";
    response.data = resp;
    return SendResponse(res);
  }, function(err) {
    console.log(err.message);
    response.error = true;
    response.status = 400;
    response.userMessage = "";
    response.data = err;
    return SendResponse(res);
  });
}

methods.searchByArea = function(req, res) {
  var inp = req.params.input;
  var area = req.params.area;
  var page = req.params.page;
  es.search({
    index: 'chiblee',
    size: 10,
    from: 10 * (page - 1),
    body: {
      query: {
        filtered: {
          query: {
            multi_match: {
              "query": inp,
              "fields": ["type", "type1", "name"],
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
    response.error = false;
    response.status = 200;
    response.userMessage = "";
    response.data = resp;
    return SendResponse(res);
  }, function(err) {
    console.log(err.message);
    response.error = true;
    response.status = 400;
    response.userMessage = "";
    response.data = err;
    return SendResponse(res);
  });
}

/*-----  End of tracking by id ------*/
