var mongoose = require('mongoose');

// Support types: http://mongoosejs.com/docs/schematypes.html
// All bids of the system.
var TicketSchema = new mongoose.Schema({
    assetId: String, //[mongoose.Schema.Types.ObjectId],
    bidId: String,
    updatedAt: { type: Date, default: Date.now },
    status: { type: Number, default: 0 },  // 0 fail, 1 succeed
});

// TODO: define when to create the index
//db.Bid.createIndex({ number: 1 }, { unique: true })   // { unique: true, sparse: true }


module.exports = mongoose.model('Ticket', TicketSchema);
