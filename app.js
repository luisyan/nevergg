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
lolAPI.setRateLimit(10, 400);

leagueAPI.init('239e4ebb-d3c7-4deb-a388-c93dd6843673', 'na');


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
    logger.trace('getting data of summoner %s...', name);
    leagueAPI.Summoner.getByName(name, 'na', function(err, result) {
        if (err) {outPutErr(res , 500, err)}
        else {
            logger.trace('Got summoner data...', result);
            res.json(result);
        }
    });
})

app.get('/summoner/currentgame', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting current game...');
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
            logger.trace( 'Got current game.');
            res.json( result );
        }
    });
})

app.get('/summoner/currentgame_2', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting current game... using 2nd key');
    lolAPI.CurrentGame.getBySummonerId(id, function(err, result) {
        if (err) {
            logger.trace('using 2nd key...get current game error, result is: ', result);
            if ( result == undefined ) {
                logger.trace('result is undefined');
                res.json( {ret: 1, result : 'The match is unavailable, player is probably not in game, try a different player'} );
            }
            //outPutErr(res , 500, err);
        }
        else
        {
            logger.trace( 'Got current game. using 2nd key...');
            res.json( result );
        }
    });
})

app.get('/summoner/solo_record', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting solo rank record of summoner %d', id);
    leagueAPI.getLeagueEntryData(id, 'na',function(err, result) {
        if (err) {
            logger.trace('error getting rank info', err);
            outPutErr(res , 500, err);
        } else {
            var soloRecord = {};
            for ( var i in result[id] ) {
                if ( result[id][i].queue == 'RANKED_SOLO_5x5' ) {
                    soloRecord = result[id][i]
                }
            }
            logger.trace( 'Got solo rank record.' );
            res.json( soloRecord );
        }
    });
})

app.get('/summoner/solo_record_2', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting solo rank record of summoner %d, using 2nd key', id);
    lolAPI.League.getEntriesBySummonerId(id, function(err, result) {
        if (err) {
            logger.trace('error getting rank info, using 2nd key', err);
            outPutErr(res , 500, err);
        } else {
            var soloRecord = {};
            for ( var i in result[id] ) {
                if ( result[id][i].queue == 'RANKED_SOLO_5x5' ) {
                    soloRecord = result[id][i]
                }
            }
            logger.trace( 'Got solo rank record. using 2nd key' );
            res.json( soloRecord );
        }
    });
})


app.get('/team/rank_record', function (req, res) {
    var id = req.param('teamId');
    id = Number(id);
    lolAPI.League.getEntriesByTeamId(id, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
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
    logger.trace('getting champion info...');
    lolAPI.Static.getChampion(id, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('Got champion info.');
        res.json(result);
    });
})

app.get('/mmr', function (req, res) {
    var name = req.param('summonerName');
    logger.trace('getting mmr of %s ...', name);
    mmr(name, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('%s\'s mmr is: ', name , result);
        res.json(result);
    });
})

app.get('/rank/stats', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting rank stats...');
    leagueAPI.Stats.getRanked(id, null, function(err, result) {
        if (err) {outPutErr(res , 500, err);}
        else
        {
            logger.trace('Got rank stats.');
            res.json( result );
        }
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
    logger.trace('getting match history...');
    lolAPI.MatchHistory.getBySummonerId(id, matchHistoryOpt, function(err, result) {
        if (err) {outPutErr(res , 500, err);}
        else
        {
            logger.trace( 'Got match history.');
            res.json( result );
        }
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