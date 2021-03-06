var express     			= require("express"),
		app								= express(),
		bodyParser  			= require("body-parser"),
		mongoose    			= require( 'mongoose' ),
		bcrypt      			= require( 'bcryptjs' ),
		jwt         			= require( 'jsonwebtoken' ),
		request     			= require( 'request' ),
		async     				= require( 'async' ),
		path     					= require( 'path' ),
		User        			= require( './models/user' ),
		Tournament  			= require( './models/tournament' ),
		Match  						= require( './models/match' ),
		authRoutes				= require( './routes/auth' ),
		adminRoutes				= require( './routes/admin' ),
		tournamentRoutes	= require( './routes/tournaments' ),
		io;

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + '/dist/';
app.use( express.static( distDir ) );

// connect to mongodb server
mongoose.connect( 'mongodb://localhost/auto_bracket' );

// Put Socket Into Req
app.use( function( req, res, next ) {
	req.io = io;
	next();
} );

// Import Routes
app.use( '/api/auth', authRoutes );
app.use( '/api/tournaments', tournamentRoutes );
app.use( '/api/admin/tournaments', adminRoutes );

// Angular Route
app.use( function( req, res, next ) {
	res.sendFile(path.join(__dirname, './dist', 'index.html'));
} );

var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );

// Initialize the app
http.listen(process.env.PORT || 3000, function () {
	var port = http.address().port;
	console.log("App now running on port", port);
});