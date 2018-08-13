let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//a router to load a URL
// app.get('/load', loadURL);
// function loadURL(req, res)

require('dotenv').load();
console.log(process.env.FOO);
function getAPIkey() {

    const pardotAuth = {
        user_key : process.env.PARDOT_USER_KEY,
        password : process.env.PARDOT_PASSWORD,
        email : process.env.PARDOT_EMAIL
    };

    let url = "https://pi.pardot.com/api/login/version/3?user_key="
        + pardotAuth.user_key + "&email=" + pardotAuth.email + "&password=" + pardotAuth.password;

    console.log(url);

    let request = require("request");
    request(url, loaded);

    // Callback for when the request is complete
    function loaded(error, response, body) {
        // Check for errors
        if (!error && response.statusCode === 200) {
            // The raw HTML is in body
            return body;
        } else {
            return body;
        }
    }
}

console.log(getAPIkey());

module.exports = app;
