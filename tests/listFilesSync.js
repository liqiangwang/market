var fs = require('fs');
var path = require('path');
var inspect = require('util').inspect;
var os = require('os');

var p = "../"
var files = fs.readdirSync(p);
files.map(function (file) {
    return path.join(p, file);
}).filter(function (file) {
    return fs.statSync(file).isFile();
}).forEach(function (file) {
    console.log("%s (%s)", file, path.extname(file));
});

