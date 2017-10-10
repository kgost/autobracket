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
	var pos = 0;

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
					liveMatches.push( { pos: pos, match: resultMatches[i] } );
					pos++;
					resultMatches.splice( i, 1 );
					i--;
				}
			}

			if ( liveMatches.length === 0 ) {
				return handleError( res, 'Found Finished Tournament', 'No matches left for ' + req.body.name + '. Mark tournament as finished or reopen matches in challonge', 400 );
			}

			Tournament.findOne( { id: req.params.chlId }, function( err, tournament ) {
				if ( err ) {
					return handleError( res, 'Failed to check for tournament', err.message );
				}

				if ( tournament ) {
					tournament.matches.forEach( function( match ) {
						Match.findByIdAndRemove( match.match, function( err ) {
							if ( err ) {
								console.log( err );
							}
						} );
					} );
					tournament.liveMatches.forEach( function( match ) {
						Match.findByIdAndRemove( match.match, function( err ) {
							if ( err ) {
								console.log( err );
							}
						} );
					} );
					tournament.streamMatches.forEach( function( match ) {
						Match.findByIdAndRemove( match.match, function( err ) {
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

						// respond with success message
						emitTournaments( req, user.username );
						res.status( 200 ).json({ message: 'Tournament successfully started' });
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

								// respond with success message
								emitTournaments( req, user.username );
								res.status( 200 ).json({ message: 'Tournament successfully started' });
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
	var result = [];

	request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments.json', function( err, response, body ) {
		if ( err ) {
			return handleError( res, 'Failed to get tournaments', err.message );
		}

		try {
			body = JSON.parse( body );
		} catch ( e ) {
			return handleError( res, 'Failed to get tournaments', 'Invalid challonge credentials, please update your settings.' );
		}
		body.forEach( function( item ) {
			if ( item.tournament.state == 'underway' || item.tournament.state == 'awaiting_review' ) {
				result.push({
					id: item.tournament.id, 
					name: item.tournament.name, 
					url: item.tournament.url
				});
			}
		} );

		async.map( user.subDomains, function( subDomain, callback ) {
			request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments.json?subdomain=' + subDomain, function( err, response, body ) {
				if ( err ) {
					callback( err );
				}

				try {
					body = JSON.parse( body );
				} catch ( e ) {
					callback( err );
				}

				var innerResults = [];
				body.forEach( function( item ) {
					if ( item.tournament.state == 'underway' || item.tournament.state == 'awaiting_review' ) {
						innerResults.push({
							id: item.tournament.id, 
							name: item.tournament.name, 
							url: item.tournament.url
						});
					}
				} );
				callback( err, innerResults );
			} );
		}, function( err, mapResults ) {
			if ( err ) {
				console.log( err );
			}

			mapResults.forEach( function( innerResults ) {
				innerResults.forEach( function( innerResult ) {
					result.push( innerResult );
				} );
			} );

			async.map( result, function( tournament, callback ) {
				Tournament.findOne( { id: tournament.id }, function( err, checkTournament ) {
					if ( checkTournament ) {
						tournament.started = true;
					} else {
						tournament.started = false;
					}
					callback( err );
				} );
			}, function( err, innerResults ) {
				if ( err ) {
					console.log( err );
				}

				res.status( 200 ).json( result );
			} );
		} );
	} );
} );

function emitTournaments( req, username ) {
	var result = [];

	User.findOne( { username: username }, function( err, user ) {
		if ( err || !user ) {
			return;
		}

		// get mongoose tournaments
		Tournament.find( { user: user._id } ).populate( 'liveMatches.match' ).populate( 'streamMatches.match' ).populate( 'matches' ).exec( function( err, tournaments ) {
			if ( err ) {
				return;
			}

			for ( var i = 0; i < tournaments.length; i++ ) {
				if ( tournaments[i].matches.length === 0 && tournaments[i].liveMatches.length === 0 && tournaments[i].streamMatches.length === 0 ) {
					removeTournament( tournaments[i]._id.toString(), user._id.toString() );
					tournaments.splice( i, 1 );
					i --;
				} else {
					result.push({
						_id: tournaments[i]._id,
						id: tournaments[i].id,
						name: tournaments[i].name,
						url: tournaments[i].url,
						streams: tournaments[i].streams,
						matches: [],
						liveMatches: [],
						streamMatches: []
					});

					for ( var j = 0; j < tournaments[i].matches.length; j++ ) {
						if ( tournaments[i].matches[j].toObject().player1 && tournaments[i].matches[j].toObject().player2 ) {
							result[i].matches.push( tournaments[i].matches[j] );
						}
					}

					tournaments[i].liveMatches.sort( function( a, b ) {
						return a.pos - b.pos;
					} );

					tournaments[i].streamMatches.sort( function( a, b ) {
						return a.pos - b.pos;
					} );

					for ( var k = 0; k < tournaments[i].liveMatches.length; k++ ) {
						result[i].liveMatches.push({
							_id: tournaments[i].liveMatches[k].match._id,
							tournamentId: tournaments[i].liveMatches[k].match.tournamentId,
							id: tournaments[i].liveMatches[k].match.id,
							pos: tournaments[i].liveMatches[k].pos,
							player1: tournaments[i].liveMatches[k].match.player1,
							player2: tournaments[i].liveMatches[k].match.player2,
							winner_id: tournaments[i].liveMatches[k].match.winner_id,
							scores_csv: tournaments[i].liveMatches[k].match.scores_csv
						});
					}

					for ( var l = 0; l < tournaments[i].streamMatches.length; l++ ) {
						result[i].streamMatches.push({
							_id: tournaments[i].streamMatches[l].match._id,
							tournamentId: tournaments[i].streamMatches[l].match.tournamentId,
							id: tournaments[i].streamMatches[l].match.id,
							pos: tournaments[i].streamMatches[l].pos,
							player1: tournaments[i].streamMatches[l].match.player1,
							player2: tournaments[i].streamMatches[l].match.player2,
							winner_id: tournaments[i].streamMatches[l].match.winner_id,
							scores_csv: tournaments[i].streamMatches[l].match.scores_csv
						});
					}
				}
			}

			req.io.sockets.emit( 'tournaments-' + username, result );
		} );
	} );
}

function removeTournament( tournamentId, userId ) {
	User.findById( userId, function( err, user ) {
		for ( var i = 0; i < user.tournaments.length; i++ ) {
			if ( user.tournaments[i].toString() == tournamentId ) {
				user.tournaments.splice( i, 1 );
				user.save();
				break;
			}
		}

		Tournament.findById( tournamentId, function( err, tournament ) {
			if ( err ) {
				console.log( err );
			}

			if ( !tournament ) {
				return;
			}

			tournament.matches.forEach( function( match ) {
				Match.findByIdAndRemove( match, function( err ) {
					if ( err ) {
						console.log( err );
					}
				} );
			} );

			tournament.remove();
		} );
	} );
}

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