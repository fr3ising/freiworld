var data_dir = process.env.OPENSHIFT_DATA_DIR || "./";

var express = require('express');
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
var fortune = require('./lib/fortune.js');
var aux = require('./lib/aux.js');
var bodyParser = require('body-parser');
var credentials = require(data_dir+'/credentials.js');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var database = require('./lib/database.js');
var formidable = require('formidable');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var app = express();

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
app.set('port', server_port);
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
	if ( rows && rows.length > 0 ) {
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

app.post('/register',function(req,res) {
    if ( ! aux.validateEmail(req.body.email) ) {
	res.render('signup',{title:'Regístrate en Freiworld',fail:"Error: email no válido"});
    }
    if ( req.body.password !== req.body.rpassword ) {
	res.render('signup',{title:'Regístrate en Freiworld',fail:"Error: los passwords no coinciden"});
    }
    if ( ! aux.validatePassword(req.body.password) ) {
	res.render('signup',{title:'Regístrate en Freiworld',fail:"Error: el password debe contener al menos 6 dígitos y caracteres"});
    }
    database.userByNick(req.body.nick,function(err,rows) {
	if ( !err ) {
	    if ( rows.length > 0 ) {
		res.render('signup',{title:'Regístrate en Freiworld',fail:"Error: nickname ya registrado"});
	    }
	} else {
	    console.log(err);
	}
    });
    database.userByEmail(req.body.email,function(err,rows) {
	if ( !err ) {
	    if ( !rows && rows.length > 0 ) {
		res.render('signup',{title:'Regístrate en Freiworld',fail:"Error: email ya registrado"});
	    }
	} else {
	    console.log(err);
	}
    });
    database.insertUser(req.body.nick,req.body.email,req.body.password);
    req.session.nick = req.body.nick;
    req.session.fail = false;
    req.session.save(function(err) {
	res.redirect('/');
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
    res.render('signin',{title:'Entrar a Freiworld',fail:req.session.fail});
});

app.get('/signup',function(req,res) {
    res.render('signup',{title:'Regístrate en Freiworld',fail:req.session.fail});
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


app.listen(app.get('port'),server_ip_address,function() {
    console.log('Express started on http://localhost'+app.get('port')+'; Press Ctrl-C to terminate.');
});
