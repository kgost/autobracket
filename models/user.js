var mongoose 								= require( 'mongoose' ),
		Schema									= mongoose.Schema,
		mongooseUniqueValidator = require( 'mongoose-unique-validator' );

var userSchema	= new Schema({
	password: { type: String, required: true },
	username: { type: String, required: true, unique: true },
	chlngUname: { type: String, required: true },
	chlngKey: { type: String, required: true },
	subDomains: [String],
	tournaments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Tournament'
	}]
});

userSchema.plugin( mongooseUniqueValidator );

module.exports = mongoose.model( 'User', userSchema );