/**
 * Created by admin on 15-03-04.
 */

var express = require('express');
var app = express();
var logger = require('./logger');
var LolApi = require('leagueapi');

LolApi.init('ad849455-ed5d-48e5-a777-180e25cbdc90', 'na');


app.get('/', function (req, res) {
    var freeChamps = [];

    LolApi.getChampions(true, function(err, champs) {
        champs.forEach(function(champ) {
            LolApi.Static.getChampionById(champ.id,'na',function(err, result) {
                if(champ.freeToPlay) {
                    freeChamps.push(result.name);
                }
                if (freeChamps.length == 10) {res.send(freeChamps);}
            });
        });
    });
})


var server = app.listen(28000);
console.log('Server is listening at', 28000)

server.timeout = 300000;
