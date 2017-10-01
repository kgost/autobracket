var express 		= require( 'express' ),
		router 			= express.Router(),
		bcrypt			= require( 'bcryptjs' ),
		jwt					= require( 'jsonwebtoken' ),
		request     = require( 'request' ),
		User 				= require( '../models/user' ),
		Tournament 	= require( '../models/tournament' );

/*
	/api/auth/signup
	POST: authenticate user, return jwt
*/
router.post( '/signup', function( req, res, next ) {
	if ( !req.body ) {
		return handleError( res, 'No user to signup', 'Invalid input', 400 );
	}

	User.create( {
		username: req.body.username,
		password: bcrypt.hashSync( req.body.password, 10 ),
		chlngUname: req.body.chlngUname,
		chlngKey: req.body.chlngKey
	}, function( err, user ) {
		if ( err ) {
			return handleError( res, 'Failed to create user', 'An error has occured' );
		}

		res.redirect( 307, '/api/auth/login' );
	} );
} );

/*
	/api/auth/login
	POST: authenticate user, return jwt
*/

router.post( '/login', function( req, res, next ) {
	if ( !req.body ) {
		return handleError( res, 'No user to signup', 'Invalid input', 400 );
	}

	User.findOne( { username: req.body.username } ).populate( 'tournaments' ).exec( function( err, user ) {
		if ( err ) {
			return handleError( res, 'Failed to find user', 'An error has occured' );
		}

		if ( !user || !bcrypt.compareSync( req.body.password, user.password ) ) {
			return handleError( res, 'Failed to loin user', 'Invalid login credentials', 401 );
		}
		
		res.status( 201 ).json({
			token: jwt.sign(
				{ user: user },
				'my nama jeff',
				{ expiresIn: 7200 } ),
			user: user.username
		});
	} );
} );

function handleError( res, reason, message, code ) {
	console.log( 'ERROR: ' + reason );
	res.status( code || 500 ).json({ error: message });
}

module.exports = router;