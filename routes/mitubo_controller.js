
var videosRegistry = require('./../mdb/videosRegistry');

var usersRegistry = require('./../mdb/usersRegistry');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var http = require('http');
var config = require('./../mitubo_config.js');
var Busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');

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

    
    res.render('register');
};

// POST /users
exports.create = function(req, res, next) {

    bcrypt.hash(req.body.password, null, null, function(err, hash) {
    	var user = {username:req.body.username, email:req.body.email, password:hash, favs:[]};

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

exports.upload = function(req, res){

    var fstream;
    var uniqid = Date.now();

    var title = req.body.title;
    var description = req.body.description;

    var busboy = new Busboy({ headers: req.headers });



    var title ="";
    var description = "";
    req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {

      if (fieldname == "title"){
        
        title = val;
        console.log("TITLE:", title);
      }

      else {
        description = val;
        console.log("DESCRIPTION:", description);
      } 
    });
    req.busboy.on('file', function (fieldname, file, filename) {

        console.log("Uploading: " + filename);
        if (filename){
            //Path where image will be uploaded
          fstream = fs.createWriteStream("/mnt/nas/" + uniqid);
          file.pipe(fstream);
          fstream.on('close', function () {    
              console.log("Upload Finished of " + uniqid);              
          });
        }
        else {
          res.redirect('back');
        }
        
    });

    req.busboy.on('finish', function() {

          var video = {}
          video["id"] = uniqid;
          video["title"] = title;
          video["desc"] = description;
          video["url"] = "http://" + config.mitubo.videosURL + "/" + uniqid;
          
	videosRegistry.addVideo(video, function(msg) {
            console.log(msg);
            res.redirect('/videos');
          })
                     //where to go next
    });

    req.pipe(req.busboy);


  }

