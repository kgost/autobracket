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
	var found = false;

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
			if ( tournament.liveMatches[i].match.toString() == req.params.mId ) {
				tournament.streamMatches = addSetup( tournament.streamMatches, tournament.liveMatches[i].match );
				tournament.liveMatches.splice( i, 1 );
				found = true;
				break;
			}
		}

		if ( found && tournament.matches.length > 0 ) {
			for ( i = 0; i < tournament.matches.length; i++ ) {
				if ( tournament.matches[i].toObject().player1 && tournament.matches[i].toObject().player2 ) {
					tournament.liveMatches = addSetup( tournament.liveMatches, tournament.matches[i]._id );
					tournament.matches.splice( i, 1 );
					break;
				}
			}
		} else {
			for ( i = 0; i < tournament.matches.length; i++ ) {
				if ( tournament.matches[i]._id.toString() == req.params.mId ) {
					tournament.streamMatches = addSetup( tournament.streamMatches, tournament.matches[i]._id );
					tournament.matches.splice( i, 1 );
					break;
				}
			}
		}

		// console.log( tournament.streamMatches );

		tournament.save( function( err ) {
			if ( err ) {
				return handleError( res, 'Failed to save tournament', err.message );
			}

			emitTournaments( req, user.username );
			res.redirect( '/api/tournaments/' + user.username );
		} );
	} );
} );

// remove a match from stream
router.delete( '/:id/stream/:mId', verifyJwt, function( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;
	var liveMin = -1;

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
			if ( tournament.streamMatches[i].match.toString() == req.params.mId ) {
				if ( tournament.liveMatches.length < tournament.setups ) {
					tournament.liveMatches = addSetup( tournament.liveMatches, tournament.streamMatches[i].match );
				} else {
					tournament.matches.unshift( tournament.streamMatches[i].match );
				}
				tournament.streamMatches.splice( i, 1 );
			}
		}

		tournament.save( function( err ) {
			if ( err ) {
				return handleError( res, 'Failed to save tournament', err.message );
			}

			req.method = 'GET';

			emitTournaments( req, user.username );
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

			if ( parseInt( response.headers.status ) >= 400 && parseInt( response.headers.status ) < 500 ) {
				req.body = tournament;

				return fixError( req, res, next );
			} else if ( parseInt( response.headers.status ) >= 500 ) {
				return handleError( res, 'Challonge Error', 'There was an error accessing challonge' );
			}

			for ( var i = 0; i < tournament.liveMatches.length; i++ ) {
				if ( tournament.liveMatches[i].match.toString() == req.params.mId ) {
					tournament.liveMatches.splice( i, 1 );
					break;
				}
			}

			for ( var j = 0; j < tournament.streamMatches.length; j++ ) {
				if ( tournament.streamMatches[j].match.toString() == req.params.mId ) {
					tournament.streamMatches.splice( j, 1 );
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
										tournament.liveMatches = addSetup( tournament.liveMatches, tournament.matches[j] );
										tournament.matches.splice( j, 1 );
									}
								}
							}
						}

						tournament.save( function( err, tournament ) {
							if ( err ) {
								return handleError( res, 'Failed to save tournament', err.message );
							}

							req.method = 'GET';

							emitTournaments( req, user.username );
							res.redirect( 303, '/api/tournaments/' + user.username );
						} );
					} );
				} );
			} );
		} );
	} );
} );

// get all tournaments
router.get( '/:user', function( req, res, next ) {
	var result = [];

	User.findOne( { username: req.params.user }, function( err, user ) {
		if ( err || !user ) {
			return handleError( res, 'Failed to find user', 'Account not found', 400 );
		}

		// get mongoose tournaments
		Tournament.find( { user: user._id } ).populate( 'liveMatches.match' ).populate( 'streamMatches.match' ).populate( 'matches' ).exec( function( err, tournaments ) {
			if ( err ) {
				return handleError( res, 'Failed to get tournaments', err.message );
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

			res.status( 200 ).json( result );
		} );
	} );
} );

function addSetup( setups, match ) {
	var c = 0;
	var temp = [];

	while( setups.length > 0 ) {
		if ( setups[0].pos != c ) {
			setups.unshift( { pos: c, match: match } );
			break;
		} else {
			temp.push( setups.shift() );
			c++;
		}
	}

	if ( setups.length === 0 ) {
		setups.push( { pos: c, match: match } );
	}

	return temp.concat( setups );
}

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

function fixError( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;
	var matches = [];
	var liveMatches = [];
	var pos = 0;

	// get starting matches
	request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.body.id + '/matches.json', function( err, response, body ) {
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
			match.tournamentId = req.body.id;

			if ( match.player1_id && match.player2_id ) {
				request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.body.id + '/participants/' + match.player1_id + '.json', function( err, response, player1 ) {
					if ( err ) {
						return handleError( res, 'Failed to get participant', err.message );
					}

					request( 'https://' + user.chlngUname + ':' + user.chlngKey + '@api.challonge.com/v1/tournaments/' + req.body.id + '/participants/' + match.player2_id + '.json', function( err, response, player2 ) {
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

			Tournament.findOne( { id: req.body.id }, function( err, tournament ) {
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

						emitTournaments( req, user.username );
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

								emitTournaments( req, user.username );
							} );
						} );
					} );
				}
			} );
		} );
	} );
}

function verifyJwt( req, res, next ) {
	jwt.verify( req.query.token, 'my nama jeff', function( err, decoded ) {
		if ( err ) {
			return handleError( res, 'Failed to verify JWT', 'You must be logged in', 401 );
		}

		next();
	} );
}

// generic error handler for api endpoints
function handleError( res, reason, message, code ) {
	console.log( 'ERROR: ' + reason );
	res.status( code || 500 ).json({ error: message });
}

module.exports = router;