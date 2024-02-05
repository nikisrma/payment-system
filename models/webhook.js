const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var WebhooksSchema = new Schema({
	
 	url 				: String,
    event_type  		: String,
    event_object 		: {type:Object},
 	created	     		: {type: Date, default: Date.now },
 
});

module.exports = mongoose.model('Webhooks', WebhooksSchema);