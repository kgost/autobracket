var express     = require("express"),
		bodyParser  = require("body-parser"),
		mongoose    = require( 'mongoose' ),
		bcrypt      = require( 'bcryptjs' ),
		jwt         = require( 'jsonwebtoken' ),
		request     = require( 'request' ),
		User        = require( './models/user' ),
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
app.get( '/api/tournaments', function( req, res, next ) {

} );
// Tournament Admin API Routes

// Get active tournaments
app.post( '/api/admin/getTournaments', function( req, res, next ) {
	request( 'https://' + req.body.username + ':' + req.body.key + '@api.challonge.com/v1/tournaments.json', function( err, response, body ) {
		if ( err ) {
			return handleError( res, 'Failed to get tournaments', err.message );
		}

		body = JSON.parse( body );
		var result = [];
		body.forEach( function( item ) {
			result.push( { id: item.tournament.id, name: item.tournament.name, game_name: item.tournament.game_name } );
		} );

		res.status( 200 ).json( result );
	} );
} );

// Setup tournament
app.post( '/api/admin/tournaments', function( req, res, next ) {

} );

// every 10 seconds check active tournaments for changes
// update active matches to be displayed
// show countdown for dq
// take input from user routes to see if match started
// when match ends, update challonge

// generic error handler for api endpoints
function handleError( res, reason, message, code ) {
	console.log( 'ERROR: ' + reason );
	res.status( code || 500 ).json({ error: message });
}

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
	return res.render( 'index.ejs' );
} );

function verifyJwt( req, res, next ) {
	jwt.verify( req.query.token, 'my nama jeff', function( err, decoded ) {
		if ( err ) {
			return handleError( res, 'You must be logged in', 'Failed to verify jwt', 401 );
		}

		next();
	} );
}