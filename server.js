var express     = require("express"),
    bodyParser  = require("body-parser"),
    mongoose    = require( 'mongoose' ),
    bcrypt      = require( 'bcryptjs' ),
    jwt         = require( 'jsonwebtoken' ),
    Contact     = require( './models/contact' );
    User        = require( './models/user' );

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + '/dist/';
app.use( express.static( distDir ) );

// enable ejs
app.set( 'view-engine', 'ejs' );

// connect to mongodb server
mongoose.connect( 'mongodb://localhost/contact_test' );

// Initialize the app.
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
  /api/contacts
  GET: finds all contacts
  POST: creates a new contact
 */

app.get( '/api/contacts', function( req, res, next ) {
  Contact.find( {}, function( err, contacts ) {
    if ( err ) {
      return handleError( res, err.message, 'Failed to get contacts' );
    }

    res.status( 200 ).json( contacts );
  } );
} );

app.post( '/api/contacts', function( req, res, next ) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if ( !req.body.name ) {
    return handleError( res, 'Invalid user input', "Must provide a name", 400 );
  }

  Contact.create( newContact, function( err, resContact ) {
    if ( err ) {
      return handleError( res, err.message, 'Failed to create new contact' );
    }

    res.status( 201 ).json( resContact );
  } );
} );

/*
  /api/contacts/:id
  GET: find the contact
  PUT: update the contact
  DELETE: remove the contact
 */

app.get( '/api/contacts/:id', function( req, res, next ) {
  Contact.findById( req.params.id, function( err, contact ) {
    if ( err ) {
      return handleError( res, err.message, 'Failed to get contact' );
    }

    res.status( 200 ).json( contact );
  } );
} );

app.put( '/api/contacts/:id', function( req, res, next ) {
  var updatedContact = req.body;
  delete updatedContact._id;

  if ( !req.body.name ) {
    return handleError( res, 'Invalid user input', "Must provide a name", 400 );
  }

  Contact.findByIdAndUpdate( req.params.id, updatedContact, function( err, contact ) {
    if ( err ) {
      return handleError( res, err.message, 'Failed to update contact' );
    }

    res.status( 200 ).json( contact );
  } );
} );

app.delete( '/api/contacts/:id', function( req, res, next ) {
  Contact.findByIdAndRemove( req.params.id, function( err ) {
    if ( err ) {
      return handleError( res, err.message, 'Failed to delete contact' );
    }

    res.status( 200 ).json( req.params.id );
  } );
} );

/*
  /api/auth/signup
  POST: create a new user, return their jwt
 */

app.post( '/api/auth/signup', function( req, res, next ) {
  if ( !req.body ) {
    return res.status( 500 ).json({
      title: 'An error occured',
      error: { message: 'No user to signup' }
    });
  }

  var user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: bcrypt.hashSync( req.body.password, 10 )
  });
  user.save( function( err, user ) {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
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

  User.findOne( { email: req.body.email }, function( err, user ) {
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