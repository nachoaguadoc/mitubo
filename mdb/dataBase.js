/*global require, exports*/



// Logger

var dataBaseURL = require("./../mitubo_config").mitubo.dataBaseURL;
var collections = ["users", "videos"];
exports.db = require("mongojs").connect(dataBaseURL, collections);

