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
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Match'
	}],
	streamMatches: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Match'
	}],
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

tournamentSchema.pre( 'remove', function( next ) {
	User.findById( this.user, function( err, user ) {
		if ( !user ) {
			return next();
		}
		
		for ( var i = 0; i < user.tournaments.length(); i++ ) {
			if ( user.tournaments[i].toString() == this._id.toString() ) {
				user.tournaments.splice( i, 1 );
				break;
			}
		}

		user.save( function( err, user ) {
			next();
		} );
	} );
} );

module.exports = mongoose.model( 'Tournament', tournamentSchema );