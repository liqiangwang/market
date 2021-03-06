var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Asset = require('../models/Asset.js');

// TODO: read cookie and filter by createdBy.
/* GET /assets listing. */
router.get('/', function (req, res, next) {
    var condition = null;
    var createdById = req.query.createdById;
    if (createdById) {
        condition = { createdById: createdById };
    }
    console.log(condition);
    Asset.find(condition, null, { sort: { number: -1 } }, function (err, assets) {
        if (err) return next(err);
        res.json(assets);
    });
});

/* POST /assets */
router.post('/', function (req, res, next) {
    Asset.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /assets/id */
router.get('/:id', function (req, res, next) {
    Asset.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


/* PUT /assets/:id */
router.put('/:id', function (req, res, next) {
    Asset.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /assets/:id */
router.delete('/:id', function (req, res, next) {
    Asset.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


module.exports = router;