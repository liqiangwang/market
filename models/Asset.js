var mongoose = require('mongoose');

// Support types: http://mongoosejs.com/docs/schematypes.html
// All assets of the system.
var AssetSchema = new mongoose.Schema({
    sheetId: mongoose.Schema.Types.ObjectId,
    number: Number, // number of items.
    category: String,
    brand: String,
    cpu: String,
    memory: String,
    harddisk: String,
    accessory: String,
    working: Boolean,
    price: Number,
    description: String,
    //photoPath: String,
    updatedAt: { type: Date, default: Date.now },
    followUps: Number,
    status: Number,  // 0 local, 1 published, 2 sold, -1 deleted.
    reviewed: Number,   // 0 pending, 1 approved, 2-rejected
    createdById: mongoose.Schema.Types.ObjectId   // User
});

// TODO: define when to create the index
//db.Asset.createIndex({ number: 1 }, { unique: true })   // { unique: true, sparse: true }


module.exports = mongoose.model('Asset', AssetSchema);
