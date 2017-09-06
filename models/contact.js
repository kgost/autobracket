var mongoose = require( 'mongoose' );

var contactSchema = new mongoose.Schema({
	name: String,
	email: String,
	phone: {
		mobile: String,
		work: String
	}
});

module.exports = mongoose.model( 'Contact', contactSchema );