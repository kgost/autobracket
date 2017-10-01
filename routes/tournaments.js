var express 		= require( 'express' ),
		router 			= express.Router(),
		bcrypt			= require( 'bcryptjs' ),
		jwt					= require( 'jsonwebtoken' ),
		request     = require( 'request' ),
		async     	= require( 'async' ),
		User 				= require( '../models/user' ),
		Tournament 	= require( '../models/tournament' ),
		Match  			= require( '../models/match' );

// Tournament API ROUTES BELOW

// move a match to stream
router.get( '/:id/stream/:mId', verifyJwt, function( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;

	Tournament.findById( req.params.id ).populate( 'matches' ).exec( function( err, tournament ) {
		if ( err ) {
			return handleError( res, 'Cannot find tournament', err.message, 400 );
		}

		if ( tournament.user.toString() != user._id.toString() ) {
			return handleError( res, 'Unauthorized user', 'You are not the owner of this match', 401 );
		}

		if ( !tournament || !tournament.liveMatches ) {
			return handleError( res, 'Cannot find tournament', 'Invalid Match', 400 );
		}

		if ( tournament.streamMatches.length >= tournament.streams ) {
			return handleError( res, 'Too many streams', 'Streams are full already', 400 );
		}

		for ( var i = 0; i < tournament.liveMatches.length; i++ ) {
			if ( tournament.liveMatches[i].toString() == req.params.mId ) {
				tournament.streamMatches.push( tournament.liveMatches[i] );
				tournament.liveMatches.splice( i, 1 );
			}
		}

		for ( var j = 0; j < tournament.matches.length && tournament.liveMatches.length < tournament.setups; j++ ) {
			if ( tournament.matches[j].toObject().player1 && tournament.matches[j].toObject().player2 ) {
				tournament.liveMatches.push( tournament.matches[j] );
				tournament.matches.splice( j, 1 );
				j--;
			}
		}

		tournament.save( function( err ) {
			if ( err ) {
				return handleError( res, 'Failed to save tournament', err.message );
			}

			res.redirect( '/api/tournaments/' + user.username );
		} );
	} );
} );

// remove a match from stream
router.delete( '/:id/stream/:mId', verifyJwt, function( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;

	Tournament.findById( req.params.id, function( err, tournament ) {
		if ( err ) {
			return handleError( res, 'Cannot find tournament', err.message, 400 );
		}

		if ( tournament.user.toString() != user._id.toString() ) {
			return handleError( res, 'Unauthorized user', 'You are not the owner of this match', 401 );
		}

		if ( !tournament || !tournament.streamMatches || tournament.streamMatches.length < 1 ) {
			return handleError( res, 'Cannot find tournament', 'Invalid Match', 400 );
		}

		for ( var i = 0; i < tournament.streamMatches.length; i++ ) {
			if ( tournament.streamMatches[i].toString() == req.params.mId ) {
				tournament.liveMatches.unshift( tournament.streamMatches[i] );
				tournament.streamMatches.splice( i, 1 );
				if ( tournament.liveMatches.length > tournament.setups ) {
					tournament.matches.unshift( tournament.liveMatches[tournament.liveMatches.length - 1] );
					tournament.liveMatches.splice( tournament.liveMatches.length - 1, 1 );
				}
			}
		}

		tournament.save( function( err ) {
			if ( err ) {
				return handleError( res, 'Failed to save tournament', err.message );
			}

			req.method = 'GET';

			res.redirect( 303, '/api/tournaments/' + user.username );
		} );
	} );
} );

// update tournament match
router.put( '/:id/matches/:mId', verifyJwt, function( req, res, next ) {
	if ( !req.body ) {
		return handleError( res, 'No match data sent', 'No match sent', 400 );
	}

	var user = jwt.decode( req.query.token ).user;
	var latestMatches = [];
	var slices = [];
	var newLive = [];

	Tournament.findById( req.params.id, function( err, tournament ) {
		if ( err ) {
			return handleError( res, 'Cannot find tournament', 'Invalid Match', 400 );
		}

		if ( tournament.user.toString() != user._id.toString() ) {
			return handleError( res, 'Unauthorized user', 'You are not the owner of this match', 401 );
		}

		// update challonge
		request({
			method: 'PUT',
			uri: 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + tournament.id + '/matches/' + req.body.id + '.json',
			body: { match: { scores_csv: req.body.scores_csv, winner_id: req.body.winner_id } },
			json: true
		}, function( err, response, body ) {
			if ( err ) {
				return handleError( res, 'Failed to update match', 'Invalid Match', 400 );
			}

			for ( var i = 0; i < tournament.liveMatches.length; i++ ) {
				if ( tournament.liveMatches[i].toString() == req.params.mId ) {
					tournament.liveMatches.splice( i, 1 );
					i--;
				}
			}

			for ( var j = 0; j < tournament.streamMatches.length; j++ ) {
				if ( tournament.streamMatches[j].toString() == req.params.mId ) {
					tournament.streamMatches.splice( j, 1 );
					j--;
				}
			}

			Match.findByIdAndRemove( req.params.mId, function( err ) {
				if ( err ) {
					return handleError( res, 'Failed to remove match', 'Server failure' );
				}

				// get matches from challonge
				request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + tournament.id + '/matches.json', function( err, response, body ) {
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
							request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + tournament.id + '/participants/' + match.player1_id + '.json', function( err, response, player1 ) {
								if ( err ) {
									return handleError( res, 'Failed to get participant', err.message );
								}

								request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + tournament.id + '/participants/' + match.player2_id + '.json', function( err, response, player2 ) {
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

						if ( tournament.liveMatches.length === 0 && tournament.streamMatches.length === 0 ) {
							tournament.matches.forEach( function( match ) {
								Match.findByIdAndRemove( match, function( err ) {
									if ( err ) {
										console.log( err );
									}
								} );
							} );
							Tournament.findByIdAndRemove( tournament._id, function( err ) {
								if ( err ) {
									return handleError( res, 'Failed to save tournament', err.message );
								}

								req.method = 'GET';

								res.redirect( 303, '/api/tournaments/' + user.username );
							} );
						} else {
							tournament.save( function( err, tournament ) {
								if ( err ) {
									return handleError( res, 'Failed to save tournament', err.message );
								}

								req.method = 'GET';

								res.redirect( 303, '/api/tournaments/' + user.username );
							} );
						}
					} );
				} );
			} );
		} );
	} );
} );

// get all tournaments
router.get( '/:user', function( req, res, next ) {
	User.findOne( { username: req.params.user }, function( err, user ) {
		if ( err ) {
			return handleError( res, 'Failed to find user', 'Account not found', 400 );
		}

		// get mongoose tournaments
		Tournament.find( { user: user._id } ).populate( 'liveMatches' ).populate( 'streamMatches' ).exec( function( err, tournaments ) {
			if ( err ) {
				return handleError( res, 'Failed to get tournaments', err.message );
			}

			res.status( 200 ).json( tournaments );
		} );
	} );
} );

// generic error handler for api endpoints
function handleError( res, reason, message, code ) {
	console.log( 'ERROR: ' + reason );
	res.status( code || 500 ).json({ error: message });
}

function verifyJwt( req, res, next ) {
	jwt.verify( req.query.token, 'my nama jeff', function( err, decoded ) {
		if ( err ) {
			return handleError( res, 'Failed to verify JWT', 'You must be logged in', 401 );
		}

		next();
	} );
}

module.exports = router;