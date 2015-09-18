var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/market', function (err) {
    if (err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
        importAssets();
    }
});

var Asset = require('../models/Asset.js');
var User = require('../models/User.js');
var helper = require('../utilities/helper.js');

function importAssets() {
    console.log("start import assets:");
    createIfNotExist(require('./assets.json'), 0);

    function createIfNotExist(assets, index) {
        if (index < assets.length) {
            var asset = assets[index];
            Asset.find({ number: asset.number }, function (err, assetsFound) {
                if (err) {
                    console.dir(err);
                }

                if (assetsFound.length == 0) {
                    console.log('create');
                    Asset.create(asset, function (err, assetToCreate) {
                        if (err) {
                            console.dir(err);
                        }
                        createIfNotExist(assets, ++index);

                    });
                }
                else {
                    console.log('update ' + assetsFound[0]._id);
                    Asset.findByIdAndUpdate(assetsFound[0]._id, asset, function (err, assetToUpdate) {
                        if (err) {
                            console.dir(err);
                        }
                        createIfNotExist(assets, ++index);
                    });
                }

            });
        }
        else {
            importUsers()
        }
    }
}



function importUsers() {
    console.log("start import users:");
    createIfNotExist(require('./users.json'), 0);

    function createIfNotExist(users, index) {
        if (index < users.length) {
            var user = users[index];
            user.password = helper.sha256(user.password);
            User.find({ alias: user.alias }, function (err, usersFound) {
                if (err) {
                    console.dir(err);
                }

                if (usersFound.length == 0) {
                    console.log('create');
                    User.create(user, function (err, userToCreate) {
                        if (err) {
                            console.dir(err);
                        }
                        createIfNotExist(users, ++index);

                    });
                }
                else {
                    console.log('update ' + user.alias);
                    User.findOneAndUpdate({ alias: user.alias }, user, function (err, userToUpdate) {
                        if (err) {
                            console.dir(err);
                        }
                        createIfNotExist(users, ++index);
                    });
                }

            });
        }
        else {
            console.log("done.");
            process.exit(0);
        }
    }


}


