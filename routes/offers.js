var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Offer = require('../models/Offer.js');

// TODO: read cookie and filter by createdBy.
/* GET /offers listing. */
//router.get('/', function (req, res, next) {
//    Offer.find(req.query, null, { sort: { updatedAt: -1 } }, function (err, offers) {
//        if (err) return next(err);
//        res.json(offers);
//    });
//});

router.get('/', function (req, res, next) {
    Offer.find(req.query, null, { sort: { price: -1 } }, function (err, offers) {
        if (err) return next(err);
        res.json(offers);
    });
});

/* POST /offers */
router.post('/', function (req, res, next) {
    Offer.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /offers/id */
router.get('/:id', function (req, res, next) {
    Offer.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


/* PUT /offers/:id */
router.put('/:id', function (req, res, next) {
    Offer.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /offers/:id */
router.delete('/:id', function (req, res, next) {
    Offer.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


module.exports = router;