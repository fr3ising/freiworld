var aux = require('./aux.js');
var database = require('./database.js');

module.exports = function(app) {

    app.post('/postLink',function(req,res,next) {
	if ( req.body.title.length < 3 || req.body.comment.length < 10 ) {
	    res.render('sendLink',
		       {title:'Enviar noticia',fail:"Error: Título o entradilla demasiado corto",
			nick:req.session.nick,
			title:req.body.title,
			comment:req.body.comment,
			uri:req.body.uri});
	} else {
	    next();
	}
    });
    
    app.post('/postLink',function(req,res,next) {
	aux.checkUrl(req.body.title.url,function(err,result) {
	    if ( err ) {
		res.render('sendLink',
			   {title:'Enviar noticia',fail:"Error: Url incorrecta",
			    nick:req.session.nick,
			    title:req.body.title,
			    comment:req.body.comment,
			    uri:req.body.uri});
	    } else {
		next();
	    }
	});
    });

}
