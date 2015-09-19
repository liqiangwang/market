var mongoose = require('mongoose');

// Support types: http://mongoosejs.com/docs/schematypes.html
// All asset sheets. A sheet has a list of assets.
var AssetSheetSchema = new mongoose.Schema({
    name: { type: String, maxlength: 200 },
    planningDeliveryTime: Date,
    planningDeliveryAddress: String,
    payMethodId: Number,  // -- dict
    dealCriteriaId: Number, // 1- 价高先得
    requireCertificate: Boolean,
    calculatedTotalPrice: Number,
    assets: Array,
    updatedAt: { type: Date, default: Date.now },
    followUps: Number,
    status: Number,  // 0 local, 1 published, 2 sold, -1 deleted.
    reviewed: Number,   // 0 pending, 1 approved, 2-rejected
    createdById: mongoose.Schema.Types.ObjectId   // User
});



module.exports = mongoose.model('AssetSheet', AssetSheetSchema);
