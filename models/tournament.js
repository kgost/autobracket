var mongoose	= require( 'mongoose' ),
		User			= require( './user' ),
		Schema		= mongoose.Schema;

var tournamentSchema = new Schema({
	id: Number,
	name: String,
	url: String,
	setups: Number,
	streams: Number,
	matches: [{ 
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Match'
	}],
	liveMatches: [{
		pos: Number,
		match: { 
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Match'
		}
	}],
	streamMatches: [{
		pos: Number,
		match: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Match'
		}
	}],
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model( 'Tournament', tournamentSchema );