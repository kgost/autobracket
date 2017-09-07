var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require( 'mongoose' );
var Contact = require( './models/contact' );

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + '/dist/';
app.use( express.static( distDir ) );

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
