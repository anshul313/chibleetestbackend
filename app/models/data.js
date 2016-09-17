var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var chibleeSchema = new Schema({
	Name: {
		type: String
	},
	Contact: {
		type: String
	},
	night: {
		type: Boolean
	},
	Categories: {
		type: String
	},
	'Sub - Cat': {
		type: String
	},
	Address: {
		type: String
	},
	Area: {
		type: String
	},
	LAT: {
		type: String
	},
	LON: {
		type: String
	},
	location: {
		type: [Number],
		required: true,
		index: "2dsphere"
	}
}, {
	strict: false
});
module.exports = mongoose.model('Chibleedata', chibleeSchema, 'vendors');
