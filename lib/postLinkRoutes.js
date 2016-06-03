var aux = require('./aux.js');
var database = require('./database.js');

module.exports = function(app) {

    app.post('/postLink',function(req,res,next) {
	if ( req.body.linkTitle.length < 3 ) {
	    res.render('sendLink',
		       {title:'Enviar noticia',
			fail:"Error: Título demasiado corto",
			nick:req.session.nick,
			linkTitle:req.body.linkTitle,
			comment:req.body.comment,
			uri:req.body.uri});
	} else {
	    next();
	}
    });
    
    app.post('/postLink',function(req,res,next) {
	aux.checkUri(req.body.uri,function(err,result) {
	    if ( err ) {
		res.render('sendLink',
			   {title:'Enviar noticia',
			    fail:'Error: link incorrecto',
			    nick:req.session.nick,
			    linkTitle:req.body.linkTitle,
			    comment:req.body.comment,
			    uri:req.body.uri});
	    } else {
		console.log("NEXTINGSSS");
		next();
	    }
	});
    });

    app.post('/postLink',function(req,res,next) {
	database.linkByUri(req.body.uri,function(err,rows) {
	    if ( !err ) {
		if ( rows.length > 0 ) {
		    res.render('sendLink',
			       {title:'Enviar noticia',
				fail:"Error: link duplicado",
				nick:req.session.nick,
				linkTitle:req.body.linkTitle,
				comment:req.body.comment,
				uri:req.body.uri});
		    
		} else {
		    console.log("NEXT");
		    next();
		}
	    } else {
		console.log("HLAKSD");
		res.redirect('500');
		console.log(err);
	    }
	});
    });
    
    app.post('/postLink',function(req,res,next) {
	console.log("LLEGANDO");
	// console.log("TRYING");
	// database.insertLink(req.body.uri,
	// 		    req.body.title,
	// 		    req.body.comment,
	// 		    req.session.nick,
	// 		    function(err,rows) {
	// 		    });
    });
	    
}
