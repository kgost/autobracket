var mongoose 								= require( 'mongoose' ),
		Schema									= mongoose.Schema,
		mongooseUniqueValidator = require( 'mongoose-unique-validator' );

var userSchema	= new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	password: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	contacts: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' } ]
});

userSchema.plugin( mongooseUniqueValidator );

module.exports = mongoose.model( 'User', userSchema );