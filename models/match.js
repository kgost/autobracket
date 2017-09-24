var mongoose	= require( 'mongoose' ),
		Schema		= mongoose.Schema;

var matchSchema = new Schema({
	tournamentId: Number,
	id: Number,
	player1: {
		id: Number,
		name: String
	},
	player2: {
		id: Number,
		name: String
	},
	winner_id: Number,
	scores_csv: String
});

module.exports = mongoose.model( 'Match', matchSchema );