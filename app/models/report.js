var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var reportSchema = new Schema({
	 vendorId :  Schema.Types.ObjectId,
	 userId : Schema.Types.ObjectId,
	 problem : {type:String}

	},{strict: false});
module.exports = mongoose.model('report', reportSchema);