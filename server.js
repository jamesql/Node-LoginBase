const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cookieSession = require('cookie-session');
const passport = require('passport');
const con = require('./functions/sql');
const hash = require('./lib/hash');


const alg = "!!!";

const app = express();
const http = require('http');
const server = http.createServer(app);

// view engine setup
app.set('trust proxy', true)
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.set('view options', {pretty: true})
.locals.pretty = app.get('env') === 'development';

app.use(logger('dev'))
.use(express.json())
.use(express.urlencoded({ extended: false }))
.use(cookieParser())
.use(express.static(path.join(__dirname, 'public')))
.use(passport.initialize())
.use(passport.session());

app.get('/getinfo', (req,res)=>{
  res.send(req.cookies.userData);
})

app.get('/auth/:username/:password', (req,res)=>{
  con.connect(function(err) {
    const data = con.query("SELECT * FROM users WHERE username='" + req.params.username + "'", function (err, result, fields) {      if (result == null) {
        // Wrong Username
      } else if (result[0].password == hash.sha256(req.params.password + alg)) {
        // User Is Authenticated
        let userinfo = {
          username : req.params.username,
          password : hash.sha256(req.params.password + alg)
        }
        res.cookie('userData', userinfo);
        res.redirect('/')
      }else {
        // Wrong Password
      }
    });
  });
})

app.use('/', require('./routes/index'))



server.listen(process.env.PORT || 80);
