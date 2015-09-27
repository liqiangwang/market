var crypto = require("crypto");

function helper()
{
    this.sha256 = function (text) {
        // TODO: consider to store bytes in DB
        return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
    };

    // convert the nested string to object.
    // for example, from:
    //  {
    //    createdById: $rootScope.user._id,
    //    status: "{ $in: [1, 4] }"
    //  }
    //  to:
    //  {
    //    createdById: $rootScope.user._id,
    //    status: { $in: [1, 4] }
    //  }
    this.convertNestedStringToObject = function (object) {
        if (object) {
            for (var a in object) {
                try {
                    var obj = JSON.parse(object[a]);
                    if (obj instanceof Object) {
                        object[a] = obj;
                    }
                }
                catch (e) {
                    // swallow this exception when the property is not a valid JSON object
                }
            }
        }
    };
}

module.exports = new helper();