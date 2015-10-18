var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
    level: { type: Number, default: 1 }, // 1: Debug, 2:Information, 3: Warning, 4: Error, 5: Fatal    // http://www.thejoyofcode.com/Logging_Levels_and_how_to_use_them.aspx
    source: String, // API
    eventId: Number,
    createdAt: { type: Date, default: Date.now },
    general: String,
    detail: {}
});

module.exports = mongoose.model('Log', LogSchema);
