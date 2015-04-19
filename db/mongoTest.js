/**
 * Created by admin on 15-04-18.
 */

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var file=require('./readJsonTest');
var logger= require('../logger');



// Connection URL
var url = 'mongodb://localhost:27017/lol_572';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    var collection = db.collection('rune');

    file.readFile('../web/resources/5.7.2/data/en_US/rune.json', function(data) {
        collection.insertOne(data, function(err, result) {
            if (err) logger.trace(err);
            logger.trace(result);
        });
    });

    //collection.findOne({key: "119"}, {fields: {'image': 1, 'id': 1}}, function(err, doc) {
    //    logger.trace('champion data: ', doc)
    //})



});