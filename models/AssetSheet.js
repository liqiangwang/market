var mongoose = require('mongoose');
var Asset = require('../models/Asset.js');

// Support types: http://mongoosejs.com/docs/schematypes.html
// All asset sheets. A sheet has a list of assets.
var AssetSheetSchema = new mongoose.Schema({
    name: { type: String, maxlength: 200 },
    planningDeliveryTime: Date,
    planningDeliveryAddress: String,
    payMethod: Number,  // dict
    dealRule: Number, // dict
    requireCertificate: Boolean,
    needDataCleanup: Boolean,
    cleanUpMethod: Number,
    totalPrice: Number,
    assets: Array,  // TODO: use [Asset] to enforce validation
    updatedAt: { type: Date, default: Date.now },
    followUps: Number,
    status: Number,  // _dict.sheetStatus
    createdById: mongoose.Schema.Types.ObjectId   // User
});

module.exports = mongoose.model('AssetSheet', AssetSheetSchema);
