var crypto = require("crypto");

function helper()
{
    this.sha256 = function (text) {
        // TODO: consider to store bytes in DB
        return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
    }
}

module.exports = new helper();