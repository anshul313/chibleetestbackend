#!/usr/bin/env node

/* jslint node: true */
'use strict';

var nats = require('nats');
var connectedNats = Object;
var connect = function() {
	// console.log("connect");
	return nats.connect();
}

var setNats = function(nats) {
	// console.log(nats);
	connectedNats = nats;
	// console.log(connectedNats);
}
var getNats = function(cb) {
	// console.log(c;
	return connectedNats;
}

// nats.on('close', function() {
// 	console.log('CLOSED');
// 	process.exit();
// });
module.exports = {
	connect: connect,
	nats: getNats,
	setNats: setNats
};