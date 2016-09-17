var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var vendorSchema = new Schema({
	  name: {type: String},
	  contact : {type: String},
	  night : {type: Boolean},
	  categories : {type: String},
	  subCat : {type: String},
	  address : {type: String},
	  area : {type: String},
	  lat : {type: String},
	  lon : {type: String},
	  openTiming : {type: Date},
	  userId : Schema.Types.ObjectId,
	  image : {type: String},
	  insertTime : {type: Date},
	  multiTime : {type: Boolean},
	  others : {type: String}
	},{strict: false});
module.exports = mongoose.model('vendor', vendorSchema);