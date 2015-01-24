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

exports.updateFavs = function(id, videoId, callback){
    db.users.findOne({
        _id: db.ObjectId(id)
    }, function(err, user) {
        if (user === undefined) {
            console.log('User ', id, ' not found');
        }
        else {
            var favs = user["favs"];
            var i = favs.indexOf(videoId);
            if(i != -1) {
                favs.splice(i, 1);
            }
            else {
		console.log("++++++++++++++++", favs);
		 favs.push(videoId);
}
	    
	    user["favs"] = favs;
		
		console.log("*************************", user["favs"]);
            db.users.save(user, function(){
		callback(user);
		
});

            
        }

    });
}

