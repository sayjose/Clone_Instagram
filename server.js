var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var db_config = require('./db');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var fs = require("fs");
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './static/img/uploads');
  },
  filename: function (req, file, cb) {
    var originalname = file.originalname;
    var type = originalname.split(".")[1];
    cb(null, file.fieldname + '-' + Date.now() + '.' +type);
  }
});

var upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'static')));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(3000, function(){
 console.log("Express server has started on port 3000");
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
 secret: '1234!@#$1234!@#$',
 resave: false,
 saveUninitialized: true,
 store:new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'webprac',
    database: 'instagram'
 })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log('serializeUser');
  done(null, user.user_id);
});

passport.deserializeUser(function(name, done) {
  console.log('deserializeUser');
  var db = mysql.createConnection(db_config);
  var sql = 'select * from `user` where `user_id`=?';
  db.query(sql, [name], function(err, results){
    if(err){
      console.log(err);
      done('There is no user.');
    } else {
      done(null, results[0]);
    }
    db.end();
  });
});


passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log('LocalStrategy');
    var db = mysql.createConnection(db_config);
    var uname = username;
    pwd = password;
    var sql = 'select * from `user` where `user_id`=?';
    db.query(sql, [uname], function(err,results){
      if(err){
        return done('There is no user.');
      }
      var user = results[0];
      if(user){
          if(pwd === user.user_pw){
            done(null, user);
          } else {
            done(null, false);
          }
      } else {

        done(null, false);
      }
      db.end();
    });
  }
));


var router = require('./router/route')(app, passport, fs, upload);
