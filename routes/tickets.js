var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Ticket = require('../models/Ticket.js');

var helper = require('../utilities/helper.js');

// TODO: read cookie and filter by createdBy.
/* GET /tickets listing. */
router.get('/', function (req, res, next) {
    var condition = null;
    if (req.query.status) {
        condition = { status: req.query.status };
    }

    Ticket.find(condition, function (err, tickets) {
        if (err) return next(err);
        res.json(tickets);
    });
});

/* POST /tickets */
router.post('/', function (req, res, next) {
    Ticket.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /tickets/id */
router.get('/:id', function (req, res, next) {
    //var condition = null;
    //if (req.query.assetId) {
    //    condition = { assetId: req.query.assetId };
    //}

    //Ticket.find(condition, null, { sort: { price: -1 } }, function (err, tickets) {
    //    if (err) return next(err);
    //    res.json(tickets);
    //});
});


/* PUT /tickets/:id */
router.put('/:id', function (req, res, next) {
    Ticket.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /tickets/:id */
router.delete('/:id', function (req, res, next) {
    Ticket.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


module.exports = router;