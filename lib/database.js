var fs = require('fs');
var mysql = require('mysql');
var login = JSON.parse(fs.readFileSync('mysql.json').toString());

var pool = mysql.createPool({
    connectionLimit : login['connectionLimit'],
    host     : 'localhost',
    user     : login['user'],
    password : login['password'],
    database : login['database']
});

function signin(nick,password,callback) {
    pool.getConnection(function(err,connection) {
	if ( err ) {
	    connection.release();
	    throw err;
	}
	connection.query("SELECT * FROM users WHERE nick=? AND password=PASSWORD(?);",
			 [nick,password],function(err,rows) {
			     callback(err,rows);
			 });
	connection.release();
    });
}

module.exports.signin = signin;
