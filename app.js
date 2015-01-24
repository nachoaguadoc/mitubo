
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var db = require('./mdb/dataBase').db;
var usersRegistry = require('./mdb/usersRegistry');
var videosRegistry = require('./mdb/videosRegistry');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var config = require("./mitubo_config");
var Busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');

var partials = require('express-partials');
// var sessionController = require('./routes/session_controller.js');
// var postController = require('./routes/post_controller');
// var userController = require('./routes/user_controller.js');

var app = express();

var bodyParser = require('body-parser')
var mituboController = require('./routes/mitubo_controller.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(Busboy());
// parse application/json
app.use(bodyParser.json())

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('--Core Blog 2014--'));
app.use(express.session());
  app.use(passport.initialize());
app.use(partials());

app.use(require('express-flash')());


// Helper dinamico:
app.use(function(req, res, next) {

   // Hacer visible req.session en las vistas
   res.locals.session = req.session;

   next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// Helper estatico:
app.locals.escapeText =  function(text) {
   return String(text)
          .replace(/&(?!\w+;)/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/\n/g, '<br>');
};
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done) {

    db.users.findOne({ email: username }, function(err, user) {
      var isValidPassword = function(password){
        return bcrypt.compareSync(password, user.password); // true
      }
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Email incorrecto.' });
      }

      if (!isValidPassword(password)) {
        return done(null, false, { message: 'Contraseña incorrecta.' });
      }
      return done(null, user);
    });
  }
));




//-- Rutas -----------------
app.get('/', mituboController.isLogged, function(req, res){
  res.redirect('/videos');
});
app.get('/login', mituboController.index);
app.get('/videos',mituboController.isLogged, mituboController.videos);
app.get('/upload', function(req, res) {
  res.render(('upload'), {});
})
app.get('/users/new', mituboController.new)
app.post('/users/new', mituboController.create)


app.post('/login', passport.authenticate('local', { successRedirect: '/videos',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);



app.post('/upload', mituboController.upload)



app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Fichero o ruta no existente:
app.use(function(req,res,next) {
    next(new Error('Recurso '+req.url+' no encontrado'));
});

// Gestion de errores

if ('development' == app.get('env')) {
  // development
  app.use(function(err,req,res,next) {
    res.render('error', { message: err.message,
                          stack:   err.stack 
              });
  });
} else { 
  // produccion
  app.use(function(err,req,res,next) {
    res.render('error', { message: err.message,
                          stack:   null 
              });
  });
}

app.post("/removeData", function(req, res){
  videosRegistry.removeVideos(function(){
    console.log("Videos borrados");
  })
})

app.post("/fav", function(req, res, next){
  usersRegistry.updateFavs(req.session.passport.user._id, req.body.videoFav, function(msg){
    console.log(msg);
      next();

  })
}, mituboController.videos);


http.createServer(app).listen(config.mitubo.port, function(){
  console.log('Express server listening on port ' + config.mitubo.port);
});
