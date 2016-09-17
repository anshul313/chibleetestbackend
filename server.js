var mongoose = require("mongoose");
var fs = require('fs');
var express = require('express');
var app = express();
var config = require('config');
var autoIncrement = require('mongoose-auto-increment')
var port = process.env.PORT || 8081; // set our port
var multer = require('multer');
var elastic = require('./elasticsearch');
// Bootstrap routes
var router = express.Router();
//connect to mongoDb
var connect = function() {
	var connection = mongoose.connect(
		'mongodb://chiblee:chiblee1212@54.169.192.5:12528/chiblee');
	//172.31.7.38
	//172.31.7.38
	autoIncrement.initialize(connection);
	// mongoose.connect('mongodb://localhost/quickly', options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);


// Bootstrap models
// fs.readdirSync(__dirname + '/app/models').forEach(function(file) {
// 	if (~file.indexOf('.js')) require(__dirname + '/app/models/' + file);
// });

// Bootstrap application settings
require('./config/express')(app);

//require('./config/amazon')(router, passport);
require('./config/routes')(router);
app.use(multer({
	dest: './uploads/'
}).any())

app.use('/v1', router);

//Install application
if (process.env.NODE_ENV != 'test') {
	app.listen(port)
	console.log(process.env.NODE_ENV, 'Quickly API\'s running on the port : ' +
		port);
}
module.exports = app;
