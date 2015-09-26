var mongoose = require('mongoose');

// Support types: http://mongoosejs.com/docs/schematypes.html
// All bids of the system.
var BidSchema = new mongoose.Schema({
    assetId: String, //[mongoose.Schema.Types.ObjectId],
    price: Number,
    updatedAt: { type: Date, default: Date.now },
    status: {type:Number, default: 0},  // 0 fail, 1 succeed
    createdById: String //[mongoose.Schema.Types.ObjectId]   // User
});

// TODO: define when to create the index
//db.Bid.createIndex({ number: 1 }, { unique: true })   // { unique: true, sparse: true }


module.exports = mongoose.model('Bid', BidSchema);
