var express     			= require("express"),
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
		tournamentRoutes	= require( './routes/tournaments' );

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + '/dist/';
app.use( express.static( distDir ) );

// connect to mongodb server
mongoose.connect( 'mongodb://localhost/smash_club' );

app.use( '/api/auth', authRoutes );
app.use( '/api/admin/tournaments', adminRoutes );
app.use( '/api/tournaments', tournamentRoutes );

// Initialize the app
var server = app.listen(process.env.PORT || 3000, function () {
	var port = server.address().port;
	console.log("App now running on port", port);
});

// Angular Route
app.use( function( req, res, next ) {
	res.sendFile(path.join(__dirname, './dist', 'index.html'));
} );