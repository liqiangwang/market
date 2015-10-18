function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

//console.log(getDateTime())

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/market', function (err) {
    if (err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

var helper = require('../utilities/helper.js');

var req = { url: 'test' };
var async = require('async');
async.series(
    [
        function (cb) { helper.log(2, "API", 0, req.url, { req: req }, function (err) { cb(); });},
        function (cb) { console.log('2'); process.exit(0); }]
    )

process.exit(1);