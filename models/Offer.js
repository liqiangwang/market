var mongoose = require('mongoose');

// Support types: http://mongoosejs.com/docs/schematypes.html
// All assets of the system.
var OfferSchema = new mongoose.Schema({
    sheetId: ObjectId,
    price: Number,
    updatedAt: { type: Date, default: Date.now },
    createdById: [mongoose.Schema.Types.ObjectId]   // User
});

// TODO: define when to create the index
//db.Offer.createIndex({ number: 1 }, { unique: true })   // { unique: true, sparse: true }


module.exports = mongoose.model('Offer', OfferSchema);
