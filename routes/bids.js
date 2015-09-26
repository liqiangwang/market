var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Bid = require('../models/Bid.js');

var helper = require('../utilities/helper.js');

// TODO: read cookie and filter by createdBy.
/* GET /bids listing. */
router.get('/', function (req, res, next) {
    var condition = null;
    if (req.query.assetId) {
        condition = { assetId: req.query.assetId };
    }

    if (req.query._id) {
        condition = { _id: req.query._id };
    }

    Bid.find(condition, null, { sort: { price: -1 } }, function (err, bids) {
        if (err) return next(err);
        res.json(bids);
    });
});

/* POST /bids */
router.post('/', function (req, res, next) {
    Bid.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /bids/id */
router.get('/:id', function (req, res, next) {
    //var condition = null;
    //if (req.query.assetId) {
    //    condition = { assetId: req.query.assetId };
    //}

    //Bid.find(condition, null, { sort: { price: -1 } }, function (err, bids) {
    //    if (err) return next(err);
    //    res.json(bids);
    //});
});


/* PUT /bids/:id */
router.put('/:id', function (req, res, next) {
    Bid.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /bids/:id */
router.delete('/:id', function (req, res, next) {
    Bid.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


module.exports = router;