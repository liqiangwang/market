var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var AssetSheet = require('../models/AssetSheet.js');

/*
GET assetSheet list ordered by updatedAt descending.
If createdById passed, return only the ones created by the specified user.
*/
router.get('/', function (req, res, next) {
    //var condition = null;
    //var createdById = req.query.createdById;
    //console.log(createdById);
    //if (createdById) {
    //    condition = { createdById: createdById };
    //}
    //console.log(condition);
    console.log(req.query);
    AssetSheet.find(req.query, null, { sort: { updatedAt: -1 } }, function (err, assets) {
        if (err) return next(err);
        res.json(assets);
    });
});

/* POST /assets */
router.post('/', function (req, res, next) {
    AssetSheet.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /assets/id */
router.get('/:id', function (req, res, next) {
    AssetSheet.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


/* PUT /assets/:id */
router.put('/:id', function (req, res, next) {
    AssetSheet.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /assets/:id */
router.delete('/:id', function (req, res, next) {
    AssetSheet.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


module.exports = router;