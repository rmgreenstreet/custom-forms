const createError = require('http-errors');
const express = require('express');
const path = require('path');
const rfs = require('rotating-file-stream')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

require('mongoose-type-url');
// const serveFavicon = require('serve-favicon');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const sgMail = require('@sendgrid/mail');
// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
	interval: '1d', // rotate daily
	path: path.join(__dirname, 'log')
});


const User = require('./models/user');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const formsRouter = require('./routes/forms');
const companiesRouter = require('./routes/companies');
const locationsRouter = require('./routes/locations');

const app = express();
if (app.get('env') == 'development'){ require('dotenv').config(); };
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//connect to database
mongoose.connect(process.env.DATABASE_URL,{
	useNewUrlParser:true, 
	useUnifiedTopology:true,
  	useFindAndModify: false,
  	useCreateIndex:true
}).then(() => {
	console.log('Connected to Mongo DB')
}).catch(err => {
	console.log('error: ',err.message)
});


// view engine setup
//use ejs-locals for all ejs templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev', { skip: function (req,res) { return res.statusCode < 400} }));
app.use(logger('common', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride("_method"));
app.use(expressSanitizer());
var expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 6) // 6 hours
app.use(expressSession({
		secret:"surfs up brah",
		resave:false,
		saveUninitialized:false,
		name: 'sessionId',
		secure:true,
		httpOnly:true,
		expires: expiryDate
		}));
app.use(passport.initialize());
app.use(passport.session());

app.disable('x-powered-by');
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy({usernameField:'personalEmail'}));

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//set local variables middleware
app.use(async function (req,res,next) {
	if (app.get('env') == 'development'){ req.user = await User.findOne({firstName: 'potato'}); };
	res.locals.currentUser = req.user;
  	//set default page title if one is not specified
	res.locals.title='Custom Forms';
	//set success flash message
	res.locals.success = req.session.success || "";
	//delete flash message after sending it to the page so it doesn't show again
	delete req.session.success;
	//set error flash message
	res.locals.error = req.session.error || "";
	//delete flash message after sending it to the page so it doesn't show again
	delete req.session.error;
	//continue on to the next function in the middlware/route chain
	next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/forms', formsRouter);
app.use('/companies', companiesRouter);
app.use('/locations', locationsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
if (app.get('env') !== 'development'){
	app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
	});
}


const { seedDatabase, clearDatabase, seedDefaultQuestions, clearRecentItems} = require('./seeds.js');

async function databaseInit() {
	await clearRecentItems();	
	// await clearDatabase();
	// await seedDefaultQuestions();
	// await seedDatabase();
	await User.register({firstName: 'potato', lastName:'head',username:'potatohead', personalEmail:'test@test.com', role:'Owner'},'password');
}

if (app.get('env') == 'development'){databaseInit();}






let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}
app.listen(port, () => {
	console.log("server has started, listening on port "+port);
});

module.exports = app;
