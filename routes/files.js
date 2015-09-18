'use strict';

// TODO: https://github.com/domharrington/fileupload

var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');
var inspect = require('util').inspect;
var os = require('os');

var Busboy = require('busboy');

//Directory to upload file
var uploadFolder = __dirname + '/../public/uploads/';

/* GET file listing. */
router.get('/', function (req, res, next) {
    fs.readdir(uploadFolder, function (err, files) {
        if (err) return next(err);

        res.json(
            files.filter(function (file) {
                return fs.statSync(path.join(uploadFolder, file)).isFile();
            })
        );
    });
});


// http://expressjs.com/api.html
// In Express 4, req.files is no longer available on the req object by default. To access uploaded files on the req.files object, use a multipart-handling middleware like busboy, multer, formidable, multiparty, connect-multiparty, or pez.
// https://www.npmjs.com/package/busboy
router.post('/upload', function (req, res, next) {
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        file.on('data', function (data) {
            console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        });
        file.on('end', function () {
            console.log('File [' + fieldname + '] Finished');
        });
        var targetPath = uploadFolder + filename;
        file.pipe(fs.createWriteStream(targetPath));  // Error: ENOENT, open 'C:\Users\bewang\OneDrive\market\routes\uploads\icon1.jpg'
        console.log(targetPath);
        //var tempPath = path.join(os.tmpDir(), filename);  //path.basename(fieldname)
        //console.log(tempPath);
        //file.pipe(fs.createWriteStream(tempPath));
        //var targetPath = __dirname + '/uploads/' + filename;
        //console.log(targetPath);
        //fs.rename(tempPath, targetPath, function (err) {
        //    if (err) throw err;
        //    // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files 
        //    fs.unlink(tempPath, function () {
        //        if (err) throw err;
        //    });
        //});
    });
    busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
        console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', function () {
        console.log('Done parsing form!');
        res.writeHead(200, { Connection: 'close' });
        res.end();
    });
    req.pipe(busboy);
});



module.exports = router;