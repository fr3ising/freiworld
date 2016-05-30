var express = require('express');
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var credentials = require('./credentials.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var database = require('./lib/database.js');
var formidable = require('formidable');

var app = express();

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
app.set('port', process.env.PORT || 3000);
app.set('env','development');
app.disable('x-powered-by');

app.use(bodyParser.json());                        
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(credentials.cookieSecret));
app.use(session({
    secret: credentials.cookieSecret,
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(function(req,res,next) {
    res.locals.showTests = (app.get('env') !== 'production') && (req.query.test === '1');
    next();
});

app.get('/',function(req,res) {
    res.render('home',{title:"Freiworld homepage",
		       nick: req.session.nick});
});

app.post('/login',function(req,res) {
    result = database.signin(req.body.nick,req.body.password,function(err,rows){
	if ( rows.length > 0 ) {
	    if ( rows[0].nick === req.body.nick ) {
		req.session.nick = rows[0].nick;
		req.session.fail = false;
		req.session.save(function(err) {
		    res.redirect('/');
		});
	    }
	} else {
	    req.session.nick = null;
	    req.session.fail = "Fallo al acceder, comprueba user y password";
	    req.session.save(function(err) {
		res.redirect('/signin');
	    });
	}
    });
});

app.get('/signout',function(req,res) {
    req.session.nick = null;
    req.session.fail = false;
    req.session.save(function(err) {
	res.redirect('/');
    });
});

app.get('/signin',function(req,res) {
    res.render('signin',{'title':'Sign in into Freiworld!','fail':req.session.fail});
});

app.get('/signup',function(req,res) {
    res.render('signup',{title:'Sign up into Freiworld!',fail:req.session.fail});
});

app.get('/about',function(req,res) {
    console.log(req.session.nick);
    res.render('about',{
	title: "About Freiworld",
	fortune: fortune.getFortune(),
	pageTestScript: "/qa/about-tests.js",
	nick: req.session.nick
    });
});

app.use(express.static(__dirname+'/public'));

app.use(function(req,res,next) {
    res.status(404);
    res.render('404');
});

app.use(function(req,res,next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'),function() {
    console.log('Express started on http://localhost'+app.get('port')+'; Press Ctrl-C to terminate.');
});
