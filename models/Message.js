var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
    topic: String,
    content: String, 
    status: { type: Number, default: 1 }, // 1:unread   2:read
    updatedAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Message', MessageSchema);
