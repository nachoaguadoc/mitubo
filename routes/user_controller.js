
var usersRegistry = require('./../mdb/usersRegistry');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var http = require('http');
var config = require('./../mitubo_config.js');
exports.index = function(req, res){

  var session = req.session.passport.user

  if (session){
      req.logout();
      session = req.session.passport.user


  }
  res.render('index',{ session: session

  });
};
// GET /users/new
exports.new = function(req, res, next) {

    
    res.render('users/new');
};

// POST /users
exports.create = function(req, res, next) {

    bcrypt.hash(req.body.password, null, null, function(err, hash) {
    	var user = {username:req.body.username, password:hash};

		usersRegistry.addUser(user, function(msg){
        	console.log(msg);
        	res.redirect("/");
    	})
	});
    
    
}


exports.isLogged = function(req, res, next){

  if (!req.session.passport.user){

    res.redirect('/login');

  }
  else {

    next();

  }

}

exports.videos = function(req, res){
    var session = req.session.passport.user

    var http  = require('http');
    var options = {
                hostname: config.mitubo.videosURL,
                path: '/getList',
                method: 'GET', //POST,PUT,DELETE etc
                port: config.mitubo.videosPort,
                headers: {'Content-Type': 'application/json'} //
              };
        //handle request;
    http.get(options, function(resp){
          resp.setEncoding('utf8');
          resp.on('data', function (data) {
                var json = JSON.parse(data);
                console.log(json); // I can't parse it because, it's a string. why?
                res.render('videos', {session: session, list: json})


          });

    }).on("error", function(e){
        console.log("Got error: " + e.message);
    });

}

