/**
 * Created by admin on 15-04-19.
 */
var fs=require('fs');
var logger= require('../logger');




exports.readFile = function (filePath, callback) {
    fs.readFile(filePath, function(err,data) {
        if (err) logger.error(err);

        var championData = JSON.parse(data);
        var count = 0;
        for (var i in championData.data) {
            championData.data[i].key = i;
            callback(championData.data[i]);
            count++;
            //logger.trace(count+'  '+championData.data[i]);
        }
    });
}

