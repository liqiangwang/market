var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = require('../models/User.js');

var helper = require('../utilities/helper.js');

//TODO: usename/password will be cached. Need to set the expiration so that login works for 1/1 then 1/2 then 1/1.
// http://jilles.me/express-routing-the-beginners-guide/
// Query
// Other option: /:alias/:password
//router.get('/*', function (req, res) {
//    var alias = req.query.alias;
//    var password = helper.sha256(req.query.password);
//    console.log(alias, password);
//    User.find({ alias: alias, password: password }, function (err, users) {
//        if (err) return next(err);
//        console.log(users);
//        res.json(users);
//    });
//});

/* GET /users listing. */
router.get('/', function (req, res, next) {
    var condition = null;
    if (req.query.status) {
        condition = { status: req.query.status };
    }
    User.find(condition, function (err, users) {
        if (err) return next(err);
        res.json(users);
    });
});

/* POST /users */
router.post('/', function (req, res, next) {
    req.body.password = helper.sha256(req.body.password);
    User.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /users/id */
router.get('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


/* PUT /users/:id */
router.put('/:id', function (req, res, next) {
    User.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /users/:id */
router.delete('/:id', function (req, res, next) {
    User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


module.exports = router;