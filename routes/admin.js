var express 		= require( 'express' ),
		router 			= express.Router(),
		bcrypt			= require( 'bcryptjs' ),
		jwt					= require( 'jsonwebtoken' ),
		request     = require( 'request' ),
		async     	= require( 'async' ),
		User 				= require( '../models/user' ),
		Tournament 	= require( '../models/tournament' ),
		Match 			= require( '../models/match' );

// Tournament Admin API Routes

// Start tournament
router.post( '/:chlId', verifyJwt, function( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;
	var matches = [];
	var liveMatches = [];
	var slices = [];

	// get starting matches
	request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.params.chlId + '/matches.json', function( err, response, body ) {
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
			match.tournamentId = req.params.chlId;

			if ( match.player1_id && match.player2_id ) {
				request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.params.chlId + '/participants/' + match.player1_id + '.json', function( err, response, player1 ) {
					if ( err ) {
						return handleError( res, 'Failed to get participant', err.message );
					}

					request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.params.chlId + '/participants/' + match.player2_id + '.json', function( err, response, player2 ) {
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
				return handleError( res, 'Failed to save match', err.message );
			}

			for ( var i = 0; i < resultMatches.length && liveMatches.length < req.body.setups; i++ ) {
				if ( resultMatches[i].toObject().player1 && resultMatches[i].toObject().player2 ) {
					liveMatches.push( resultMatches[i] );
					slices.push( i );
					resultMatches.splice( i, 1 );
					i--;
				}
			}

			Tournament.findOne( { id: req.params.chlId }, function( err, tournament ) {
				if ( err ) {
					return handleError( res, 'Failed to check for tournament', err.message );
				}

				if ( tournament ) {
					tournament.matches.forEach( function( match ) {
						Match.findByIdAndRemove( match, function( err ) {
							if ( err ) {
								console.log( err );
							}
						} );
					} );
					tournament.liveMatches.forEach( function( match ) {
						Match.findByIdAndRemove( match, function( err ) {
							if ( err ) {
								console.log( err );
							}
						} );
					} );
					tournament.streamMatches.forEach( function( match ) {
						Match.findByIdAndRemove( match, function( err ) {
							if ( err ) {
								console.log( err );
							}
						} );
					} );
					Tournament.findByIdAndUpdate( tournament._id, {
						id: req.body.id,
						name: req.body.name,
						url: req.body.url,
						setups: req.body.setups,
						streams: req.body.streams,
						streamMatches: [],
						matches: resultMatches,
						liveMatches: liveMatches,
						user: user
					}, function( err, tournament ) {
						if ( err ) {
							return handleError( res, 'Failed to save tournament', err.message );
						}

						if ( req.goTo ) {
							req.method = 'GET';

							return res.redirect( 303, '/api/tournaments/' + user.username );
						}

						// respond with success message
						res.status( 200 ).json({ message: 'Tournament successfully created' });
					} );
				} else {
					Tournament.create( {
						id: req.body.id,
						name: req.body.name,
						url: req.body.url,
						setups: req.body.setups,
						streams: req.body.streams,
						streamMatches: [],
						matches: resultMatches,
						liveMatches: liveMatches,
						user: user
					}, function( err, tournament ) {
						if ( err ) {
							return handleError( res, 'Failed to save tournament', err.message );
						}

						User.findById( user._id, function( err, user ) {
							if ( err ) {
								return handleError( res, 'Failed to update user', 'Error updating account' );
							}

							user.tournaments.push( tournament );
							user.save( function( err ) {
								if ( err ) {
									return handleError( res, 'Failed to save user', 'Error saving user' );
								}

								if ( req.goTo ) {
									req.method = 'GET';

									return res.redirect( 303, '/api/tournaments/' + user.username );
								}

								// respond with success message
								res.status( 200 ).json({ message: 'Tournament successfully created' });
							} );
						} );
					} );
				}
			} );
		} );
	} );
} );


router.put( '/:chlId', verifyJwt, function( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;
	var matches = [];
	var liveMatches = [];
	var slices = [];

	// get starting matches
	request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.params.chlId + '/matches.json', function( err, response, body ) {
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
			match.tournamentId = req.params.chlId;

			if ( match.player1_id && match.player2_id ) {
				request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.params.chlId + '/participants/' + match.player1_id + '.json', function( err, response, player1 ) {
					if ( err ) {
						return handleError( res, 'Failed to get participant', err.message );
					}

					request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.params.chlId + '/participants/' + match.player2_id + '.json', function( err, response, player2 ) {
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
				return handleError( res, 'Failed to save match', err.message );
			}

			for ( var i = 0; i < resultMatches.length && liveMatches.length < req.body.setups; i++ ) {
				if ( resultMatches[i].toObject().player1 && resultMatches[i].toObject().player2 ) {
					liveMatches.push( resultMatches[i] );
					slices.push( i );
					resultMatches.splice( i, 1 );
					i--;
				}
			}

			Tournament.findOne( { id: req.params.chlId }, function( err, tournament ) {
				if ( err ) {
					return handleError( res, 'Failed to check for tournament', err.message );
				}

				if ( tournament ) {
					tournament.matches.forEach( function( match ) {
						Match.findByIdAndRemove( match, function( err ) {
							if ( err ) {
								console.log( err );
							}
						} );
					} );
					tournament.liveMatches.forEach( function( match ) {
						Match.findByIdAndRemove( match, function( err ) {
							if ( err ) {
								console.log( err );
							}
						} );
					} );
					tournament.streamMatches.forEach( function( match ) {
						Match.findByIdAndRemove( match, function( err ) {
							if ( err ) {
								console.log( err );
							}
						} );
					} );
					Tournament.findByIdAndUpdate( tournament._id, {
						id: req.body.id,
						name: req.body.name,
						url: req.body.url,
						setups: req.body.setups,
						streams: req.body.streams,
						streamMatches: [],
						matches: resultMatches,
						liveMatches: liveMatches,
						user: user
					}, function( err, tournament ) {
						if ( err ) {
							return handleError( res, 'Failed to save tournament', err.message );
						}

						req.method = 'GET';

						res.redirect( 303, '/api/tournaments/' + user.username );
					} );
				} else {
					Tournament.create( {
						id: req.body.id,
						name: req.body.name,
						url: req.body.url,
						setups: req.body.setups,
						streams: req.body.streams,
						streamMatches: [],
						matches: resultMatches,
						liveMatches: liveMatches,
						user: user
					}, function( err, tournament ) {
						if ( err ) {
							return handleError( res, 'Failed to save tournament', err.message );
						}

						User.findById( user._id, function( err, user ) {
							if ( err ) {
								return handleError( res, 'Failed to update user', 'Error updating account' );
							}

							user.tournaments.push( tournament );
							user.save( function( err ) {
								if ( err ) {
									return handleError( res, 'Failed to save user', 'Error saving user' );
								}

								req.method = 'GET';

								res.redirect( 303, '/api/tournaments/' + user.username );
							} );
						} );
					} );
				}
			} );
		} );
	} );
} );

// Get active tournaments
router.get( '/', verifyJwt, function( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;

	request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments.json', function( err, response, body ) {
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
			if ( item.tournament.state != 'pending' && item.tournament.state != 'ended' ) {
				result.push({
					id: item.tournament.id, 
					name: item.tournament.name, 
					url: item.tournament.url
				});
			}
		} );

		res.status( 200 ).json( result );
	} );
} );

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