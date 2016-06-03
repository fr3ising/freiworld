var data_dir = process.env.OPENSHIFT_DATA_DIR || "./";
var express = require('express');
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
var fortune = require('./lib/fortune.js');
var aux = require('./lib/aux.js');
var bodyParser = require('body-parser');
var credentials = require(data_dir+'/credentials.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var fileStore = require('session-file-store')(session);
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
    store: new fileStore,
    saveUninitialized: true
}));

app.use(function(req,res,next) {
    res.locals.showTests = (app.get('env') !== 'production') && (req.query.test === '1');
    next();
});

app.get('/',function(req,res) {
    database.lastLinks(10,function(err,rows) {
	res.render('home',{
	    title:"Freiworld homepage",
	    nick: req.session.nick,
	    links: rows});
    });
});

app.post('/login',function(req,res) {
    database.signin(req.body.nick,req.body.password,function(err,rows){
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

var registerRoutes = require('./lib/registerRoutes.js');
registerRoutes(app);

var postLinkRoutes = require('./lib/postLinkRoutes.js');
postLinkRoutes(app);

app.get('/link/:id',function(req,res) {
    database.linkById(req.params.id,function(err,rows) {
	if ( !err ) {
	    res.render('link',{ title: rows[0].title,
				linkTitle: rows[0].title,
				uri: rows[0].uri,
				comment: rows[0].comment,
				fail:false,
				nick: req.session.nick
			      });
	} else {
	    res.redirect('500');
	}
    });
});

app.get('/sendLink',function(req,res) {
    res.render('sendLink',{ title: 'Enviar noticia',fail:false,nick:req.session.nick});
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
