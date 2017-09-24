var mongoose	= require( 'mongoose' ),
		Schema		= mongoose.Schema;

var tournamentSchema = new Schema({
	id: Number,
	name: String,
	username: String,
	key: String,
	setups: Number,
	matches: [{ 
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Match'
	}],
	liveMatches: [{ 
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Match'
	}]
});

module.exports = mongoose.model( 'Tournament', tournamentSchema );