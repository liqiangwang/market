'use strict';

var fs = require('fs');
var path = require('path');
var inspect = require('util').inspect;
var os = require('os');
var p = "../"
fs.readdir(p, function (err, files) {
    if (err) {
        throw err;
    }

    files.map(function (file) {
        return file;  //path.join(p, file)
    }).filter(function (file) {
        return fs.statSync(path.join(p, file)).isFile();
    }).forEach(function (file) {
        console.log("%s (%s)", file, path.extname(file));
    });
});
