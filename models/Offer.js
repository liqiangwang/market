var mongoose = require('mongoose');

// Support types: http://mongoosejs.com/docs/schematypes.html
// All assets of the system.
var OfferSchema = new mongoose.Schema({
    sheetId: mongoose.Schema.Types.ObjectId,
    assets: Array,  // [{assetId:, price:}]
    updatedAt: { type: Date, default: Date.now },
    status: { type: Number, default: 0 },  // 0 fail, 1 succeed
    createdById: mongoose.Schema.Types.ObjectId   // User
});

// TODO: define when to create the index
//db.Offer.createIndex({ number: 1 }, { unique: true })   // { unique: true, sparse: true }


module.exports = mongoose.model('Offer', OfferSchema);
