var mongoose = require('mongoose');

// Support types: http://mongoosejs.com/docs/schematypes.html
// All asset sheets. A sheet has a list of assets.
var AssetSheetSchema = new mongoose.Schema({
    name: { type: String, maxlength: 200 },
    planningDeliveryTime: Date,
    planningDeliveryAddress: String,
    payMethod: Number,  // dict
    dealRule: Number, // dict
    requireCertificate: Boolean,
    totalPrice: Number,
    assets: Array,
    updatedAt: { type: Date, default: Date.now },
    followUps: Number,
    status: Number,  // _dict.sheetStatus
    createdById: mongoose.Schema.Types.ObjectId   // User
});

module.exports = mongoose.model('AssetSheet', AssetSheetSchema);
