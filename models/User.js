var mongoose = require('mongoose');

// All users of the system, including students, teachers, contacts of students or any other kind of users.
var UserSchema = new mongoose.Schema({
    userId: Number,
    alias: String,  // unique
    phone: String,  // unique, one phone number, used for login
    email: String,  // unique, one email address, used for login
    password: String,   // hashed password (use SHA-256)
    autonym: String,   // autonym in ID card
    socialId: String,   // Identity no
    socialIdType: Number,   // Identity card type
    license: String,    // path to license.
    note: String,
    status: { type: Number, default: 1 }, // 1:active, 2 locked, 3 marked as deleted
    updatedAt: { type: Date, default: Date.now },
});

// TODO: define when to create the index
//db.User.createIndex({ alias: 1 }, { unique: true })   // { unique: true, sparse: true }
//db.User.createIndex({ email: 1 }, { unique: true })   // { unique: true, sparse: true }


module.exports = mongoose.model('User', UserSchema);
