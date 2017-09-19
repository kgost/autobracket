var express     = require("express"),
    bodyParser  = require("body-parser"),
    mongoose    = require( 'mongoose' ),
    bcrypt      = require( 'bcryptjs' ),
    jwt         = require( 'jsonwebtoken' ),
    User        = require( './models/user' );

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

// CONTACTS API ROUTES BELOW

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