var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
var users = require('./routes/users');
var todos = require('./routes/todos');
var files = require('./routes/files');
var assets = require('./routes/assets');
var assetSheets = require('./routes/assetSheets');

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/market', function (err) {
    if (err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

var app = express();

// TODO: decide to use SPA or mulitple page.
// TODO: use ejs, jade or no template
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/', routes);
app.use(function (req, res, next) {
    if (req.url.match(/^\/api\/.+/)) {
        res.setHeader('Pragma', 'No-cache');
        res.setHeader('Cache-Control', 'no-cache'); //HTTP 1.0 
        res.setHeader('expires', '-1');
    }
    next();
});

app.use('/api/users', users);
app.use('/api/todos', todos);
app.use('/api/files', files);
app.use('/api/assets', assets);
app.use('/api/assetSheets', assetSheets);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// customized filter
//app.filter('true_false', function () {
//    return function (text, length, end) {
//        if (text) {
//            return 'Yes';
//        }
//        return 'No';
//    }
//});

module.exports = app;
