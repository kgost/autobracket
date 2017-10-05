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
	PUT: update user, return updated user
*/
router.post( '/signup', function( req, res, next ) {
	if ( !req.body ) {
		return handleError( res, 'No user to signup', 'Invalid input', 400 );
	}

	var subDomains = [];

	req.body.subDomain = req.body.subDomain.replace( /\s/g, '' );
	subDomains = req.body.subDomain.split( ',' );

	User.create( {
		username: req.body.username,
		password: bcrypt.hashSync( req.body.password, 10 ),
		chlngUname: req.body.chlngUname,
		chlngKey: req.body.chlngKey,
		subDomains: subDomains
	}, function( err, user ) {
		if ( err ) {
			return handleError( res, 'Failed to create user', err.message );
		}

		res.redirect( 307, '/api/auth/login' );
	} );
} );

router.put( '/signup', verifyJwt, function( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;
	var subDomains = [];

	if ( !req.body ) {
		return handleError( res, 'No user to update', 'Invalid input', 400 );
	}

	req.body.subDomain = req.body.subDomain.replace( /\s/g, '' );
	subDomains = req.body.subDomain.split( ',' );

	user.chlngUname = req.body.chlngUname;
	user.chlngKey = req.body.chlngKey;
	user.subDomains = subDomains;

	User.findByIdAndUpdate( user._id, user, function( err ) {
		if ( err ) {
			return handleError( res, 'Failed to create user', err.message );
		}

		res.status( 201 ).json({
			token: jwt.sign(
				{ user: user },
				'my nama jeff',
				{ expiresIn: 7200 } ),
			user: user.username,
			message: 'Settings Saved'
		});
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

	User.findOne( { username: req.body.username }, function( err, user ) {
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

router.get( '/', verifyJwt, function( req, res, next ) {
	var user = jwt.decode( req.query.token ).user;
	var subDomain = '';

	user.username = null;
	user.password = null;

	for ( var i = 0; i < user.subDomains.length; i++ ) {
		subDomain += user.subDomains[i];

		if ( i != user.subDomains.length - 1 ) {
			subDomain += ',';
		}
	}

	user.subDomain = subDomain;

	res.status( 200 ).json( user );
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