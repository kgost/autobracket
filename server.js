var express     = require("express"),
		bodyParser  = require("body-parser"),
		mongoose    = require( 'mongoose' ),
		bcrypt      = require( 'bcryptjs' ),
		jwt         = require( 'jsonwebtoken' ),
		request     = require( 'request' ),
		async     	= require( 'async' ),
		path     		= require( 'path' ),
		User        = require( './models/user' ),
		Tournament  = require( './models/tournament' ),
		Match  			= require( './models/match' ),
		username    = 'kgost',
		key         = 'EYOpNxxPaQhr2c4xlC3EnHFY3lk4WPiGCyfcMPhm';

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + '/dist/';
app.use( express.static( distDir ) );

// enable ejs
app.set( 'view-engine', 'ejs' );

// connect to mongodb server
mongoose.connect( 'mongodb://localhost/smash_club' );

// Initialize the app
var server = app.listen(process.env.PORT || 3000, function () {
	var port = server.address().port;
	console.log("App now running on port", port);
});

// Tournament API ROUTES BELOW

// update tournament match
app.post( '/api/tournaments/match', verifyJwt, function( req, res, next ) {
	if ( !req.body ) {
		return handleError( res, 'No match sent', 'Invalid Match', 400 );
	}

	var latestMatches = [];
	var slices = [];
	var newLive = [];

	Tournament.findOne( { id: req.body.tournamentId }, function( err, tournament ) {
		if ( err ) {
			return handleError( res, 'Cannot find tournament', 'Invalid Match', 400 );
		}

		req.body.auth = { username: tournament.username, key: tournament.key };

		// update challonge
		request({
			method: 'PUT',
			uri: 'https://' + tournament.username + ':' + tournament.key + '@api.challonge.com/v1/tournaments/' + tournament.id + '/matches/' + req.body.id + '.json',
			body: { match: { scores_csv: req.body.scores_csv, winner_id: req.body.winner_id } },
			json: true
		}, function( err, response, body ) {
			if ( err ) {
				return handleError( res, 'Failed to update match', 'Invalid Match', 400 );
			}

			for ( var i = 0; i < tournament.liveMatches.length; i++ ) {
				if ( tournament.liveMatches[i].toString() == req.body._id.toString() ) {
					tournament.liveMatches.splice( i, 1 );
				}
			}

			Match.findByIdAndRemove( req.body._id, function( err ) {
				if ( err ) {
					return handleError( res, 'Failed to remove match', 'Server failure' );
				}

				// get matches from challonge
				request( 'https://' + tournament.username + ':' + tournament.key + '@api.challonge.com/v1/tournaments/' + tournament.id + '/matches.json', function( err, response, body ) {
					if ( err ) {
						return handleError( res, 'Failed to get matches', err.message );
					}

					body = JSON.parse( body );
					body.forEach( function( item ) {
						if ( !item.match.winner_id ) {
							latestMatches.push( item.match );
						}
					} );

					latestMatches.sort( function( a, b ) {
						return a.suggested_play_order - b.suggested_play_order;
					} );

					async.map( latestMatches, function( match, callback ) {
						match.tournamentId = tournament.id;

						if ( match.player1_id && match.player2_id ) {
							request( 'https://' + req.body.auth.username + ':' + req.body.auth.key + '@api.challonge.com/v1/tournaments/' + tournament.id + '/participants/' + match.player1_id + '.json', function( err, response, player1 ) {
								if ( err ) {
									return handleError( res, 'Failed to get participant', err.message );
								}

								request( 'https://' + req.body.auth.username + ':' + req.body.auth.key + '@api.challonge.com/v1/tournaments/' + tournament.id + '/participants/' + match.player2_id + '.json', function( err, response, player2 ) {
									if ( err ) {
										return handleError( res, 'Failed to get participant', err.message );
									}

									player1 = JSON.parse( player1 );
									player2 = JSON.parse( player2 );
									match.player1 = { id: player1.participant.id, name: player1.participant.name };
									match.player2 = { id: player2.participant.id, name: player2.participant.name };
									Match.findOneAndUpdate( { id: match.id }, match, function( err, newMatch ) {
										newMatch.player1 = match.player1;
										newMatch.player2 = match.player2;
										callback( err, newMatch );
									} );
								} );
							} );
						} else {
							Match.findOneAndUpdate( { id: match.id }, match, function( err, newMatch ) {
								callback( err, newMatch );
							} );
						}
					}, function( err, resultMatches ) {
						for ( var i = 0; i < resultMatches.length && tournament.liveMatches.length < tournament.setups; i++ ) {
							var match = resultMatches[i].toObject();
							if ( match.player1 && match.player2 ) {
								for ( var j = 0; j < tournament.matches.length; j++ ) {
									if ( tournament.matches[j].toString() == match._id.toString() ) {
										tournament.liveMatches.push( match );
										tournament.matches.splice( j, 1 );
									}
								}
							}
						}

						if ( tournament.liveMatches.length === 0 ) {
							Tournament.findByIdAndRemove( tournament._id, function( err ) {
								if ( err ) {
									return handleError( res, 'Failed to save tournament', err.message );
								}

								return res.redirect( '/api/tournaments' );
							} );
						} else {
							tournament.save( function( err, tournament ) {
								if ( err ) {
									return handleError( res, 'Failed to save tournament', err.message );
								}

								res.redirect( '/api/tournaments' );
							} );
						}
					} );
				} );
			} );
		} );
	} );
} );

// get all tournaments
app.get( '/api/tournaments', function( req, res, next ) {
	// get mongoose tournaments
	Tournament.find({}).populate( 'liveMatches' ).exec( function( err, tournaments ) {
		if ( err ) {
			return handleError( res, 'Failed to get tournaments', err.message );
		}

		tournaments.forEach( function( tournament ) {
			tournament.key = null;
		} );

		res.status( 200 ).json( tournaments );
	} );
	// respond with active matches
} );


// Tournament Admin API Routes

// Get active tournaments
app.post( '/api/admin/getTournaments', verifyJwt, function( req, res, next ) {
	request( 'https://' + req.body.username + ':' + req.body.key + '@api.challonge.com/v1/tournaments.json', function( err, response, body ) {
		if ( err ) {
			return handleError( res, 'Failed to get tournaments', err.message );
		}

		try {
			body = JSON.parse( body );
		} catch ( e ) {
			return handleError( res, 'Failed to get tournaments', 'Invalid challonge credentials' );
		}
		var result = [];
		body.forEach( function( item ) {
			if ( item.tournament.state != 'pending' ) {
				result.push( { id: item.tournament.id, name: item.tournament.name, game_name: item.tournament.game_name } );
			}
		} );

		res.status( 200 ).json( result );
	} );
} );

app.post( '/api/admin/restartTournament', verifyJwt, function( req, res, next ) {
	if ( !req.body.tournament || !req.body.auth ) {
		return handleError( res, 'No tournament sent', 'Invalid Tournament', 400 );
	}

	var allMatches = [];

	Tournament.findOne( { id: req.body.tournament.id }, function( err, tournament ) {
		if ( err ) {
			return handleError( res, 'Failed to find tournament', err.message );
		}

		if ( !tournament ) {
			return res.redirect( 307, '/api/admin/startTournament' );
		}

		tournament.matches.forEach( function( match ) {
			allMatches.push( match );
		} );

		tournament.liveMatches.forEach( function( match ) {
			allMatches.push( match );
		} );

		async.map( allMatches, function( match, callback ) {
			Match.findByIdAndRemove( match, function( err ) {
				callback( err );
			} );
		}, function( err ) {
			if ( err ) {
				console.log( err );
			}
			Tournament.findByIdAndRemove( tournament._id, function( err ) {
				if ( err ) {
					handleError( res, 'Failed to remove tournament', err.message );
				}

				res.redirect( 307, '/api/admin/startTournament' );
			} );
		} );
	} );
} );

// Start tournament
app.post( '/api/admin/startTournament', verifyJwt, function( req, res, next ) {
	if ( !req.body.tournament || !req.body.auth ) {
		return handleError( res, 'No tournament sent', 'Invalid Tournament', 400 );
	}

	var matches = [];
	var liveMatches = [];
	var slices = [];

	// get starting matches
	request( 'https://' + req.body.auth.username + ':' + req.body.auth.key + '@api.challonge.com/v1/tournaments/' + req.body.tournament.id + '/matches.json', function( err, response, body ) {
		if ( err ) {
			return handleError( res, 'Failed to get matches', err.message );
		}

		body = JSON.parse( body );
		body.forEach( function( match ) {
			if ( !match.match.winner_id ) {
				matches.push( match.match );
			}
		} );

		matches.sort( function( a, b ) {
			return a.suggested_play_order - b.suggested_play_order;
		} );
		// create tournament in mongodb
		async.map( matches, function( match, callback ) {
			match.tournamentId = req.body.tournament.id;

			if ( match.player1_id && match.player2_id ) {
				request( 'https://' + req.body.auth.username + ':' + req.body.auth.key + '@api.challonge.com/v1/tournaments/' + req.body.tournament.id + '/participants/' + match.player1_id + '.json', function( err, response, player1 ) {
					if ( err ) {
						return handleError( res, 'Failed to get participant', err.message );
					}

					request( 'https://' + req.body.auth.username + ':' + req.body.auth.key + '@api.challonge.com/v1/tournaments/' + req.body.tournament.id + '/participants/' + match.player2_id + '.json', function( err, response, player2 ) {
						if ( err ) {
							return handleError( res, 'Failed to get participant', err.message );
						}

						player1 = JSON.parse( player1 );
						player2 = JSON.parse( player2 );
						match.player1 = { id: player1.participant.id, name: player1.participant.name };
						match.player2 = { id: player2.participant.id, name: player2.participant.name };
						Match.create( match, function( err, newMatch ) {
							callback( err, newMatch );
						} );
					} );
				} );
			} else {
				Match.create( match, function( err, newMatch ) {
					callback( err, newMatch );
				} );
			}
		}, function( err, resultMatches ) {
			if ( err ) {
				handleError( res, 'Failed to save match', err.message );
			}

			for ( var i = 0; i < resultMatches.length && liveMatches.length < req.body.tournament.setups; i++ ) {
				if ( resultMatches[i].toObject().player1 && resultMatches[i].toObject().player2 ) {
					liveMatches.push( resultMatches[i] );
					slices.push( i );
					resultMatches.splice( i, 1 );
					i--;
				}
			}

			Tournament.create( {
				id: req.body.tournament.id,
				name: req.body.tournament.name,
				username: req.body.auth.username,
				key: req.body.auth.key,
				setups: req.body.tournament.setups,
				matches: resultMatches,
				liveMatches: liveMatches
			}, function( err, tournament ) {
				if ( err ) {
					handleError( res, 'Failed to save tournament', err.message );
				}

				// respond with success message
				res.status( 200 ).json({ message: 'Tournament successfully created' });
			} );
		} );
	} );
} );

// every 10 seconds check active tournaments for changes
// update active matches to be displayed
// show countdown for dq
// take input from user routes to see if match started
// when match ends, update challonge

/*
/api/auth/login
POST: authenticate user, return jwt
*/

app.post( '/api/auth/login', function( req, res, next ) {
	if ( !req.body ) {
		return res.status( 500 ).json({
			title: 'An error occured',
			error: { message: 'No user to login' }
		});
	}

	User.findOne( { username: req.body.username }, function( err, user ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}

		if ( !user || !bcrypt.compareSync( req.body.password, user.password ) ) {
			return res.status( 401 ).json({
				title: 'Login Failed',
				error: { message: 'Invalid login credentials' }
			});
		}

		res.status( 201 ).json({
			token: jwt.sign(
				{ user: user },
				'my nama jeff',
				{ expiresIn: 7200 } ),
			userId: user._id
		});
	} );
} );

// Angular Route
app.use( function( req, res, next ) {
	res.sendFile(path.join(__dirname, './dist', 'index.html'));
} );

// generic error handler for api endpoints
function handleError( res, reason, message, code ) {
	console.log( 'ERROR: ' + reason );
	res.status( code || 500 ).json({ error: message });
}

function verifyJwt( req, res, next ) {
	jwt.verify( req.query.token, 'my nama jeff', function( err, decoded ) {
		if ( err ) {
			return handleError( res, 'You must be logged in', 'Failed to verify jwt', 401 );
		}

		next();
	} );
}