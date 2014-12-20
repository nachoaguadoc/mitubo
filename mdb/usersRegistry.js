var db = require('./dataBase').db;

var getUser = exports.getUser = function(id, callback) {
    "use strict";

    db.users.findOne({
        _id: db.ObjectId(id)
    }, function(err, user) {
        if (user === undefined) {
            console.log('User ', id, ' not found');
        }
        if (callback !== undefined) {
            callback(user);
        }
    });
};

var hasUser = exports.hasUser = function(id, callback) {
    "use strict";

    getUser(id, function(user) {
        if (user === undefined) {
            callback(false);
        } else {
            callback(true);
        }
    });
};

exports.addUser = function(user, callback) {
    "use strict";

    db.users.save(user, function(error, saved) {
        if (error) console.log('MongoDB: Error adding user: ', error);
        if (callback !== undefined) {
            callback(saved);
        }
    });
};

/*
 * Removes a determined room from the data base.
 */
var removeUser = exports.removeUser = function(id, callback) {
    "use strict";

    hasUser(id, function(hasUser) {
        if (hasUser) {
            db.users.remove({
                _id: db.ObjectId(id)
            }, function(error, removed) {
                if (error) console.log('MongoDB: Error removing user: ', error);
                callback("yes");
            });
        }
    });
};

