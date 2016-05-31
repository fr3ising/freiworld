var data_dir = process.env.OPENSHIFT_DATA_DIR || "./";
var fs = require('fs');
var mysql = require('mysql');
var login = JSON.parse(fs.readFileSync(data_dir+'/mysql.json').toString());

console.log('USER = '+login['user']);

var pool = mysql.createPool({
    connectionLimit : login['connectionLimit'],
    host     : 'localhost',
    user     : login['user'],
    password : login['password'],
    database : login['database']
});

function userByNick(nick,callback) {
    pool.getConnection(function(err,connection) {
	if ( err ) {
	    if (connection) connection.release();
	    throw err;
	}
	connection.query("SELECT * FROM users WHERE nick=?;",
			 [nick],function(err,rows) {
			     callback(err,rows);
			 });
	if (connection) connection.release();
    });
}

function userByEmail(nick,callback) {
    pool.getConnection(function(err,connection) {
	if ( err ) {
	    if (connection) connection.release();
	    throw err;
	}
	connection.query("SELECT * FROM users WHERE email=?;",
			 [nick],function(err,rows) {
			     callback(err,rows);
			 });
	if (connection) connection.release();
    });
}

function insertUser(nick,email,password) {
    pool.getConnection(function(err,connection) {
	if ( err ) {
	    if (connection) connection.release();
	    throw err;
	}
	connection.query("INSERT INTO users (nick,email,password) VALUES (?,?,PASSWORD(?));",
			 [nick,email,password],function(err,rows) {
			 });
	if (connection) connection.release();
    });
}    

function signin(nick,password,callback) {
    pool.getConnection(function(err,connection) {
	if ( err ) {
	    if (connection) connection.release();
	    throw err;
	}
	connection.query("SELECT * FROM users WHERE nick=? AND password=PASSWORD(?);",
			 [nick,password],function(err,rows) {
			     callback(err,rows);
			 });
	if (connection) connection.release();
    });
}

module.exports.signin = signin;
module.exports.userByNick = userByNick;
module.exports.userByEmail = userByEmail;
module.exports.insertUser = insertUser;
