var express = require('express');
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
var fortune = require('./lib/fortune.js');

var app = express();

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
app.set('port', process.env.PORT || 3000);



console.log(fortune.getFortune())
