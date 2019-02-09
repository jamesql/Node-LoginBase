const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cookieSession = require('cookie-session');
const passport = require('passport');
const settings = require('./settings.json');
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

app.get('/logout', (req,res)=>{
  res.clearCookie('userData')
  res.redirect('/')
})

app.get('/auth/:username/:password', (req,res)=>{
  con.connect(function(err) {
    const data = con.query("SELECT COUNT(*) AS total FROM users WHERE username='" + req.params.username + "'", function (err, result, fields) {
      if (result[0].total == 0) {
        res.redirect('/login')
      } else if (result[0].password == hash.sha256(req.params.password + alg)) {
        console.log("Authenticated!")
        let userinfo = {
          username : req.params.username,
          password : hash.sha256(req.params.password + alg)
        }
        res.cookie('userData', userinfo);
        res.redirect('/')
      }else {
        res.redirect('/login')
      }
    });
  });
})

app.get('/createuser/:username/:password/:classcode', (req,res)=>{
  con.connect(function(err) {
  const data = con.query("SELECT COUNT(*) AS total FROM users WHERE username='" + req.params.username + "'", function (err, result, fields) {
    if (result[0].total == 0) {
      const reg = con.query("INSERT INTO users (username,password,classcode) VALUES ('" + req.params.username + "','" + hash.sha256(req.params.password + alg) + "','" + req.params.classcode + "')", function (err2, result2, fields2) {
    });
    res.redirect('/login')
  }else{
      res.redirect('/register')
      }
    });
  });
})

app.use('/', require('./routes/index'))
app.use('/register', require('./routes/register'))
app.use('/login', require('./routes/login'))


server.listen(process.env.PORT || 80);
