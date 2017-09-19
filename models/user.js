var mongoose 								= require( 'mongoose' ),
		Schema									= mongoose.Schema,
		mongooseUniqueValidator = require( 'mongoose-unique-validator' );

var userSchema	= new Schema({
	password: { type: String, required: true },
	username: { type: String, required: true, unique: true }
});

userSchema.plugin( mongooseUniqueValidator );

module.exports = mongoose.model( 'User', userSchema );