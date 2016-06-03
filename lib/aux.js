function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validatePassword(password) {
    var ren = /[A-Za-z]+/;
    var rel = /\d+/;
    return (rel.test(password)) && (ren.test(password)) && (password.length > 6);
}

function checkUrl(url,callback) {
    var request = require('request');
    var options = {
	url: url,
	port: 80,
	method: 'GET'
    };
    request.get(options, {timeout: 30000, json:false}, function (err, result) {
	callback(err,result);
    });
}

module.exports.validateEmail = validateEmail;
module.exports.validatePassword = validatePassword;
module.exports.checkUrl = checkUrl;
