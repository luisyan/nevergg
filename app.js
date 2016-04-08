/**
 * Created by admin on 15-03-04.
 */
var REGION = 'na';

var express = require( 'express' );
var app = express();
var logger = require( './logger' );
var mmr = require( 'opgg-mmr' );
var MongoClient = require( 'mongodb' ).MongoClient;
var leagueAPI = require( 'leagueapi' );

var lolAPI = require( 'lolapi' )( '209ebe2d-e2dd-444a-8181-c3c95f15d8c2' , REGION );
leagueAPI.init( '209ebe2d-e2dd-444a-8181-c3c95f15d8c2' , REGION );
leagueAPI.setRateLimit( 3000 , 180000 );
lolAPI.setRateLimit( 3000 , 180000 );


var dataVersion = '572'
var url = 'mongodb://localhost:27017/lol_' + dataVersion;
var route = '/api';


MongoClient.connect( url , function (err , db) {
    console.log( "Connected to db lol " + dataVersion );

    app.get( route + '/' , function (req , res) {
        var freeChamps = [];

        leagueAPI.getChampions( true , function (err , champs) {
            champs.forEach( function (champ) {
                leagueAPI.Static.getChampionById( champ.id , REGION , function (err , result) {
                    if ( champ.freeToPlay ) {
                        freeChamps.push( result.name );
                    }
                    if ( freeChamps.length == 10 ) {
                        res.send( freeChamps );
                    }
                } );
            } );
        } );
    } )

    app.get( route + '/summoner/id' , function (req , res) {
        var name = req.param( 'summonerName' );
        var region = req.param('region');
        var fixedName = fixName( name );
        var collection = db.collection( 'playerData' );
        collection.find( {'fixedName' : fixedName, 'region': region}).toArray(function (err , result) {
            logger.trace( 'getting data of summoner %s from db...' , name );
            if ( err ) {
                logger.error( 'error getting summoner data from db' )
            }
            if ( result[0] == null ) {
                logger.trace( 'It did not find summoner %s in db, going to query from lol API...' , name );
                leagueAPI.Summoner.getByName( name , {region : region} , function (err , result) {
                    if ( err ) {
                        logger.trace( 'error getting summoner by id' );
                        res.json( {ret : 1} );
                    }
                    else {
                        //insert into db
                        for ( var i in result ) {
                            result[i].fixedName = fixedName;
                            result[i].region = region;
                            collection.insertOne( result[i] , function (err , result) {
                                if ( err ) {
                                    logger.trace( err );
                                }
                                logger.trace( 'Player ' + name + ' has been inserted into db' );
                            } );
                            logger.trace( 'Got summoner data from lol API...' );
                            res.json( result[i] );
                        }
                    }
                } );
            }
            else {
                logger.trace( 'Got summoner data from db...' , result[0] );
                res.json( result[0] );
            }
        } )

    } )

    app.get( route + '/summoner/currentgame' , function (req , res) {
        var id = req.param( 'summonerId' );
        var region = req.param('region');
        id = Number( id );
        logger.trace( 'getting current game...' );
        lolAPI.CurrentGame.getBySummonerId( id , {region: region} , function (err , result) {
            if ( err ) {
                logger.trace( 'get current game error, result is: ' , result );
                if ( result == undefined ) {
                    logger.trace( 'result is undefined' );
                    res.json( {
                        ret    : 1 ,
                        result : 'The match is unavailable, player is probably not in game, try a different player'
                    } );
                }
                //outPutErr(res , 500, err);
            }
            else {
                logger.trace( 'Got current game.' );
                res.json( result );
            }
        } );
    } )

    app.get( route + '/summoner/currentgame_2' , function (req , res) {
        var id = req.param( 'summonerId' );
        id = Number( id );
        logger.trace( 'getting current game... using 2nd key' );
        lolAPI.CurrentGame.getBySummonerId( id , function (err , result) {
            if ( err ) {
                logger.trace( 'using 2nd key...get current game error, result is: ' , result );
                if ( result == undefined ) {
                    logger.trace( 'result is undefined' );
                    res.json( {
                        ret    : 1 ,
                        result : 'The match is unavailable, player is probably not in game, try a different player'
                    } );
                }
                //outPutErr(res , 500, err);
            }
            else {
                logger.trace( 'Got current game. using 2nd key...' );
                res.json( result );
            }
        } );
    } )

    app.get( route + '/summoner/solo_record' , function (req , res) {
        var id = req.param( 'summonerId' );
        var region = req.param('region');
        id = Number( id );
        logger.trace( 'getting solo rank record of summoner %d' , id );
        leagueAPI.getLeagueEntryData( id , region , function (err , result) {
            var soloRecord = {
                ret : 1 , tier : 'unknown' , queue : 'RANKED_SOLO_5x5'
            };
            if ( err ) {
                logger.trace( 'Error occurs, This summoner has no rank information' );
                res.json( soloRecord );
            }
            else {
                if ( result != null ) {
                    for ( var i in result[id] ) {
                        if ( result[id][i].queue == 'RANKED_SOLO_5x5' ) {
                            soloRecord = result[id][i]
                        }
                    }
                    logger.trace( 'Got solo rank record. using 1st key' );
                    res.json( soloRecord );
                }
                else {
                    logger.trace( 'No error, This summoner has no rank information' );
                    res.json( soloRecord );
                }
            }
        } );
    } )

    app.get( route + '/summoner/solo_record_2' , function (req , res) {
        var id = req.param( 'summonerId' );
        id = Number( id );
        logger.trace( 'getting solo rank record of summoner %d, using 2nd key' , id );
        lolAPI.League.getEntriesBySummonerId( id , function (err , result) {
            var soloRecord = {
                ret : 1 , tier : 'unknown' , queue : 'RANKED_SOLO_5x5'
            };
            if ( err ) {
                logger.trace( 'Error occurs, This summoner has no rank information' );
                res.json( soloRecord );
            }
            else {
                if ( result != null ) {
                    for ( var i in result[id] ) {
                        if ( result[id][i].queue == 'RANKED_SOLO_5x5' ) {
                            soloRecord = result[id][i]
                        }
                    }
                    logger.trace( 'Got solo rank record. using 2nd key' );
                    res.json( soloRecord );
                }
                else {
                    logger.trace( 'This summoner has no rank information' );
                    res.json( soloRecord );
                }
            }
        } );
    } )

    app.get( route + '/team/rank_record' , function (req , res) {
        var id = req.param( 'teamId' );
        id = Number( id );
        lolAPI.League.getEntriesByTeamId( id , function (err , result) {
            if ( err ) {
                outPutErr( res , 500 , err )
            }
            ;
            logger.trace( 'team rank info: ' , result );
            res.json( result );
        } );
    } )

    app.get( route + '/match' , function (req , res) {
        var id = req.param( 'matchId' );
        id = Number( id );
        leagueAPI.getMatch( id , true , REGION , function (err , result) {
            if ( err ) {
                outPutErr( res , 500 , err )
            }
            ;
            logger.trace( 'match info: ' , result );
            res.json( result );
        } );
    } )

    app.get( route + '/team/by_summoner_id' , function (req , res) {
        var id = req.param( 'summonerId' );
        id = Number( id );
        lolAPI.Team.getBySummonerId( id , function (err , result) {
            if ( err ) {
                outPutErr( res , 500 , err )
            }
            ;
            logger.trace( 'team info: ' , result );
            res.json( result );
        } );
    } )

    app.get( route + '/champion/by_id' , function (req , res) {
        var id = req.param( 'championId' );
        id = Number( id );
        logger.trace( 'getting champion info...' );
        lolAPI.Static.getChampion( id , function (err , result) {
            if ( err ) {
                outPutErr( res , 500 , err )
            }
            ;
            logger.trace( 'Got champion info.' );
            res.json( result );
        } );
    } )

    app.get( route + '/mmr' , function (req , res) {
        var name = req.param( 'summonerName' );
        logger.trace( 'getting mmr of %s ...' , name );
        mmr( name , function (err , result) {
            if ( err ) {
                outPutErr( res , 500 , err )
            }
            ;
            logger.trace( 'Got %s\'s mmr is: ' , name );
            res.json( result );
        } );
    } )

    app.get( route + '/rank/stats' , function (req , res) {
        var id = req.param( 'summonerId' );
        var region = req.param('region');
        id = Number( id );
        logger.trace( 'getting rank stats...' );
        leagueAPI.Stats.getRanked( id, 2016, region, function (err , result) {
            if ( err ) {
                logger.trace( 'Summoner %d has no rank stats' , id );
                res.json( {ret : 1} );
            }
            else {
                logger.trace( 'Got rank stats.' );
                res.json( result );
            }
        } );
    } )

    app.get( route + '/summoner/summary' , function (req , res) {
        var id = req.param( 'summonerId' );
        id = Number( id );
        leagueAPI.Stats.getPlayerSummary( id , 2016 , REGION , function (err , result) {
            if ( err ) {
                outPutErr( res , 500 , err )
            }
            ;
            res.json( result );
        } );
    } )

    var matchHistoryOpt = {seasons: '2016',rankedQueues : ['TEAM_BUILDER_DRAFT_RANKED_5x5'] , beginIndex : '0' , endIndex : '10'};
    app.get( route + '/summoner/matchHistory' , function (req , res) {
        var id = req.param( 'summonerId' );
        var region = req.param('region');
        id = Number( id );
        logger.trace( 'getting match history...' );
        leagueAPI.getMatchHistory( id , matchHistoryOpt, region, function (err , result) {
            if ( err ) {
                res.json( {ret : 1} );
            }
            else {
                logger.trace( 'Got match history.', id ,  result);
                res.json(result);

            }
        } );
    } )

    app.get( route + '/summoner/matchHistoryDetails' , function (req , res) {
        var matchId = req.param('matchId');
            leagueAPI.getMatch(matchId, function(err, result){
                if (err) logger.trace('err getting single match', result);
                logger.trace('got individual match details', matchId);
                res.json(result);

            })

    })



    app.get( route + '/featuredGames' , function (req , res) {
        leagueAPI.getFeaturedGames( REGION , function (err , result) {
            if ( err ) {
                res.json( {ret : 1} );
            }
            else {
                logger.trace( 'Got featured games' );
                res.json( result );
            }
        } )
    } );

    app.get( route + '/db/champion/all/icon' , function (req , res) {
        logger.trace( 'getting all champion icons from db...' );
        var collection = db.collection( 'champion' );
        collection.find( {} , {fields : {'image.full' : 1 , 'key' : 1}} ).toArray( function (err , doc) {
            if ( err ) {
                logger.trace( 'Error getting all champion icon name from db' );
                res.json( {ret : 1} );
            }
            else {
                logger.trace( 'Got all champion icons name from db ' );
                res.json( doc );
            }
        } );
    } )

    app.get( route + '/db/champion' , function (req , res) {
        logger.trace( 'getting champion data from db...' );
        var collection = db.collection( 'champion' );
        var id = req.param( 'championId' );
        collection.find( {key : id.toString()} , {fields : {'image' : 1 , 'id' : 1}}).toArray(function (err , doc) {
            if ( err ) {
                logger.trace( 'Error getting champion from db' );
                res.json( {ret : 1} );
            }
            else {
                doc = doc[0];
                var championData = {
                    name : doc.id , iconName : doc.image.full
                }
                logger.trace( 'Got champion data from db ' );
                res.json( championData );
            }
        } );
    } )

    app.get( route + '/db/rune' , function (req , res) {
        logger.trace( 'getting rune data from db...' );
        var collection = db.collection( 'rune' );
        var id = req.param( 'runeId' );
        collection.find( {'key' : id} , {fields : {'description' : 1 , 'stats' : 1}}).toArray(function (err , doc) {
            if ( err ) {
                logger.trace( 'Error getting rune from db' );
                res.json( {ret : 1} );
            }
            else {
                doc = doc[0];
                var runeData = {
                    description : doc.description , stats : doc.stats
                }
                res.json( runeData );
            }
        } );
    } )

    app.get( route + '/db/spell' , function (req , res) {
        logger.trace( 'getting summoner spell from db...' );
        var collection = db.collection( 'summoner' );
        var id = req.param( 'spellId' );
        collection.find( {'key' : id.toString()} , {fields : {'image.full' : 1}}).toArray(function (err , doc) {
            if ( err ) {
                logger.trace( 'Error getting summoner spell from db' );
                res.json( {ret : 1} );
            }
            else {
                doc = doc[0];
                var spellData = {
                    image : doc.image.full
                }
                logger.trace( 'Got summoner spell from db ' );
                res.json( spellData );
            }
        } );
    } )

} );

var server = app.listen( 28000 );
console.log( 'Server is listening at' , 28000 )

server.timeout = 300000;

function outPutErr(res , code , err) {
    try {
        if ( code === undefined ) {
            code = 500;
        }
        if ( err === undefined ) {
            err = -111;
        }
        res.status( code );
        res.json( {ret : err} );
    }
    catch ( err ) {
        logger.error( 'Catch exception in outPutError, Err msg = %s' , err );
    }
}

function fixName(name) {
    var removeSpace = name.replace( /\s+/g , "" );
    var removeUpperDot = removeSpace.replace( "'" , "" );
    var removeDot = removeUpperDot.replace( "'" , "" );
    var fixed = removeDot.toLowerCase();
    return fixed;
}