// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
// process is default we'll be using next week
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
// different way of talking to our db
var passport = require('passport');
// handles log in
var flash    = require('connect-flash');
// shows you the error message
var morgan       = require('morgan');
// logger => running the entire time the server is making and logs actions taking place in your app
var cookieParser = require('cookie-parser');
// helps us look at cookies => individual files that stay on your computer and help you manage sessions
var bodyParser   = require('body-parser');
// look at request bodys being sent back and forth. With newer versions of express, built in
var session      = require('express-session');
// once the user logs in, you want to make sure they're still logged in. Session is terminated once they log out. User can jump around from page to page without losing connection.
var configDB = require('./config/database.js');
// same thing as a function call => whatever gets returned (an object in this case) => copies the object and places it in the server.js
var db

// configuration ===============================================================
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(configDB.url, (err, database) => {
  // passing connection url into connect method to connect to our db
  if (err) return console.log(err)
  db = database
  // our connection to our db is stored in db
  require('./app/routes.js')(app, passport, db);
  // this is a function that we call to have access to routes.js
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration
// will spit out a function

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')) // dont need to route indiv. files

app.set('view engine', 'ejs'); // set up ejs for templating
// required for passport
app.use(session({
    secret: 'rcbootcamp2022a', // session secret
    resave: true,
    saveUninitialized: true
}));
// secret is so the session is unique
// secret to stay logged in, don't need to know how it works
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
