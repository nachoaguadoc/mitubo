
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


var partials = require('express-partials');
// var sessionController = require('./routes/session_controller.js');
// var postController = require('./routes/post_controller');
// var userController = require('./routes/user_controller.js');

var app = express();

var bodyParser = require('body-parser')
var usersController = require('./routes/user_controller.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

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


    db.users.findOne({ username: username }, function(err, user) {
      var isValidPassword = function(password){
        return bcrypt.compareSync(password, user.password); // true
      }
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (!isValidPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));




//-- Rutas -----------------
app.get('/', usersController.isLogged, function(req, res){
  res.redirect('/videos');
});
app.get('/login', usersController.index);
app.get('/videos',usersController.isLogged, usersController.videos);

app.get('/users/new', usersController.new)
app.post('/users/new', usersController.create)


app.post('/login', passport.authenticate('local', { successRedirect: '/videos',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
// //-- Session ---------------

// app.get('/login',  sessionController.new);
// app.post('/login', sessionController.create);
// app.get('/logout', sessionController.destroy);

// //-- Auto Load -------------

// app.param('postid',postController.load);
// app.param('userid', userController.load);

// //-- Posts -----------------

// app.get(   '/posts',                 postController.index);
// app.get(   '/posts/new',             sessionController.loginRequired,
//                                      postController.new);
// app.get(   '/posts/:postid([0-9]+)', postController.show);
// app.post(  '/posts',                 sessionController.loginRequired,
//                                      postController.create);

// app.get(   '/posts/:postid([0-9]+)/edit', sessionController.loginRequired,
//                                           postController.loggedUserIsAuthor,
//                                           postController.edit);

// app.put(   '/posts/:postid([0-9]+)', sessionController.loginRequired,
//                                      postController.loggedUserIsAuthor,
//                                      postController.update);

// app.delete('/posts/:postid([0-9]+)', sessionController.loginRequired,
//                                      postController.loggedUserIsAuthor,
//                                      postController.destroy);

// //-- Users -----------------

// app.get(   '/users',                 userController.index);

// app.get(   '/users/new',             userController.new);

// app.get(   '/users/:userid([0-9]+)', userController.show);

// app.post(  '/users',                 userController.create);

// app.get(   '/users/:userid([0-9]+)/edit', sessionController.loginRequired,
//                                      userController.loggedUserIsUser,
//                                      userController.edit);

// app.put(   '/users/:userid([0-9]+)', sessionController.loginRequired,
//                                      userController.loggedUserIsUser,
//                                      userController.update);

// app.delete('/users/:userid([0-9]+)', sessionController.loginRequired,
//                                     userController.destroy);

//--------------------------


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


http.createServer(app).listen(config.mitubo.port, function(){
  console.log('Express server listening on port ' + app.get('port'));
});
