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
    console.log('Rendering '+req+' to user '+req.session.username);
    res.render('home',{"title":"Freiworld homepage"});
});

app.post('/login',function(req,res) {
    result = database.signin(req.body.nick,req.body.password);
    console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    console.log(result);
    if ( result ) {
	console.log("SUCCESS LOGIN AS "+req.body.nick);
    }
    console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    res.redirect('/');
});

app.get('/signin',function(req,res) {
    res.render('signin',{'title':'Sign in into Freiworld!'});
});


app.get('/about',function(req,res) {
    res.render('about',{
	title: "About Freiworld",
	fortune: fortune.getFortune(),
	pageTestScript: "/qa/about-tests.js"
    });
});


app.post('/retrieve-video-list', function(req,res) {
    res.set('Content-Type','text/plain');
    var s = '';
    for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    s += req.body.name;
    console.log('Received video list query for '+ req.body.name + ' <' + req.body.email + '>');
    res.send(s);
});

app.get('/categories/video-list', function(req,res) {
    res.render('categories/video-list',{
	title: "Video list"
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

console.log(fortune.getFortune());

