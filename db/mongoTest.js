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


    //champion
    var collection = db.collection('champion');
    file.readFile('../web/resources/5.20.1/data/en_US/champion.json', function(data) {
        collection.insertOne(data, function(err, result) {
            if (err) logger.trace(err);
        });
    });
    /*
    //championFull
    collection = db.collection('championFull');
    file.readFile('../web/resources/5.7.2/data/en_US/championFull.json', function(data) {
        collection.insertOne(data, function(err, result) {
            if (err) logger.trace(err);
        });
    });
    //mastery
    collection = db.collection('mastery');
    file.readFile('../web/resources/5.7.2/data/en_US/mastery.json', function(data) {
        collection.insertOne(data, function(err, result) {
            if (err) logger.trace(err);
        });
    });
    //summoner spell
    collection = db.collection('summoner');
    file.readFile('../web/resources/5.7.2/data/en_US/summoner.json', function(data) {
        collection.insertOne(data, function(err, result) {
            if (err) logger.trace(err);
        });
    });
    //item
    collection = db.collection('item');
    file.readFile('../web/resources/5.7.2/data/en_US/item.json', function(data) {
        collection.insertOne(data, function(err, result) {
            if (err) logger.trace(err);
        });
    });


    //rune
    collection = db.collection('rune');
    file.readFile_rune('../web/resources/5.7.2/data/en_US/rune.json', function(data) {
        collection.insertOne(data, function(err, result) {
            if (err) logger.trace(err);
        });
    });

    */



});
