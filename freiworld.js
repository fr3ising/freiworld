var express = require('express');
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var credentials = require('./credentials.js');
var cookieParser = require('cookie-parser');

var app = express();

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
app.set('port', process.env.PORT || 3000);


var tours = [
    { id: 0, name: 'Hood River', price: 99.99 },
    { id: 1, name: 'Oregon Coast', price: 149.95 },
];

app.set('env','development');

app.disable('x-powered-by');

app.use(bodyParser.json());                        
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(credentials.cookieSecret));

app.use(function(req,res,next) {
    res.locals.showTests = (app.get('env') !== 'production') && (req.query.test === '1');
    next();
});

app.get('/headers',function(req,res) {
    res.set('Content-Type','text/plain');
    var s = '';
    for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

app.get('/api/tours',function(req,res) {
    res.json(tours);
});

app.get('/',function(req,res) {
    res.render('home',{"title":"Freiworld homepage"});
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

app.get('/categories/porn', function(req,res) {
    res.render('categories/porn',{
	title: "Porn category"
    });
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

