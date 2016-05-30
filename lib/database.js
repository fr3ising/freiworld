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

function userByNick(nick) {
    pool.getConnection(function(err,connection) {
	if ( err ) {
	    connection.release();
	    throw err;
	}
	connection.query("SELECT * FROM users WHERE nick=?;",[nick],function(err,rows) {
	    console.log(rows);
	});
	connection.release();
    });
}

function signin(nick,password,callback) {
    pool.getConnection(function(err,connection) {
	if ( err ) {
	    connection.release();
	    throw err;
	}
	connection.query("SELECT * FROM users WHERE nick=? AND password=PASSWORD(?);",[nick,password],function(err,rows) {
	    callback(err,rows);
	});
	console.log("Releasing connection");
	connection.release();
    });
}

module.exports.userByNick = userByNick;
module.exports.signin = signin;
