/**
 * Created by admin on 15-03-04.
 */

var express = require('express');
var app = express();
var logger = require('./logger');
var leagueAPI = require('leagueapi');
var lolAPI = require('lolapi')('ad849455-ed5d-48e5-a777-180e25cbdc90', 'na');
var mmr = require('opgg-mmr');

leagueAPI.setRateLimit(8, 300);
lolAPI.setRateLimit(8, 300);

leagueAPI.init('ad849455-ed5d-48e5-a777-180e25cbdc90', 'na');


app.get('/', function (req, res) {
    var freeChamps = [];

    leagueAPI.getChampions(true, function(err, champs) {
        champs.forEach(function(champ) {
            leagueAPI.Static.getChampionById(champ.id,'na',function(err, result) {
                if(champ.freeToPlay) {
                    freeChamps.push(result.name);
                }
                if (freeChamps.length == 10) {res.send(freeChamps);}
            });
        });
    });
})

app.get('/summoner/id', function (req, res) {
    var name = req.param('summonerName');

    leagueAPI.Summoner.getByName(name, 'na', function(err, result) {
        if (err) {outPutErr(res , 500, err)}
        else {
            logger.trace('summoner info', result);
            res.json(result);
        }
    });
})

app.get('/summoner/currentgame', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting current game');
    leagueAPI.getCurrentGame(id, 'na', function(err, result) {
        if (err) {
            logger.trace('get current game error, result is: ', result);
            if ( result == undefined ) {
                logger.trace('result is undefined');
                res.json( {ret: 1, result : 'The match is unavailable, player is probably not in game, try a different player'} );
            }
            //outPutErr(res , 500, err);
        }
        else
        {
            logger.trace( 'current game result: ' , result );
            logger.trace( 'I am here' );
            res.json( result );
        }
    });
})

app.get('/summoner/solo_record', function (req, res) {
    var id = req.param('summonerId');
    logger.trace('summoner id is: ', typeof id , id);
    id = Number(id);
    logger.trace('summoner id is: ', typeof id , id);
    leagueAPI.getLeagueEntryData(id, 'na',function(err, result) {
        if (err) {
            logger.trace('error getting rank info', err);
            outPutErr(res , 500, err);
        } else {
            logger.trace( '555555555555' , result );
            var soloRecord = {};
            for ( var i in result[id] ) {
                if ( result[id][i].queue == 'RANKED_SOLO_5x5' ) {
                    soloRecord = result[id][i]
                }
            }
            logger.trace( 'rank solo info: ' , soloRecord );
            res.json( soloRecord );
        }
    });
})

app.get('/team/rank_record', function (req, res) {
    var id = req.param('teamId');
    id = Number(id);
    lolAPI.League.getEntriesByTeamId(id, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        //var soloRecord = {};
        //logger.trace(result);
        //for (var i in result[id]) {
        //    if (result[id][i].queue == 'RANKED_SOLO_5x5') {
        //        soloRecord = result[id][i]
        //    }
        //}
        logger.trace('team rank info: ', result);
        res.json(result);
    });
})

app.get('/match', function (req, res) {
    var id = req.param('matchId');
    id = Number(id);
    leagueAPI.getMatch(id, true, 'na', function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('match info: ', result);
        res.json(result);
    });
})

app.get('/team/by_summoner_id', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    lolAPI.Team.getBySummonerId(id, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('team info: ', result);
        res.json(result);
    });
})

app.get('/champion/by_id', function (req, res) {
    var id = req.param('championId');
    id = Number(id);
    logger.trace('championId is: ', id);
    lolAPI.Static.getChampion(id, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('champion info: ', result);
        res.json(result);
    });
})

app.get('/mmr', function (req, res) {
    var name = req.param('summonerName');
    logger.trace('99999999999',typeof name , name);
    mmr(name, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('%s\'s mmr is: ', name , result);
        res.json(result);
    });
})

app.get('/rank/stats', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    leagueAPI.Stats.getRanked(id, null, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        res.json(result);
    });
})

app.get('/summoner/summary', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    leagueAPI.Stats.getPlayerSummary(id, null, 'na', function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        res.json(result);
    });
})

var matchHistoryOpt = {rankedQueues: ['RANKED_SOLO_5x5'], beginIndex: 1, endIndex: 10};
app.get('/summoner/matchHistory', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    leagueAPI.getMatchHistory(id, matchHistoryOpt, 'na', function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('--------------------',result);
        res.json(result);
    });
})



var server = app.listen(28000);
console.log('Server is listening at', 28000)

server.timeout = 300000;


function outPutErr(res, code, err) {
    try {
        if (code === undefined) {
            code = 500;
        }
        if (err === undefined) {
            err = -111;
        }
        res.status(code);
        res.json({ret: err});
    }
    catch (err) {
        logger.error('Catch exception in outPutError, Err msg = %s', err);
    }
};