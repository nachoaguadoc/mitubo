
var videosRegistry = require('./../mdb/videosRegistry');

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


    videosRegistry.getList(function(videos){

        res.render('videos', {session: session, list: videos})
    })

}

