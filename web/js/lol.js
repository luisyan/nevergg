/**
 * Created by admin on 15-03-05.
 */


$(document).ready(function(){
    var count_load_rank = 0;
    var opts = {
        lines: 10, // 花瓣数目
        length: 15, // 花瓣长度
        width: 6, // 花瓣宽度
        radius: 15, // 花瓣距中心半径
        corners: 1, // 花瓣圆滑度 (0-1)
        rotate: 0, // 花瓣旋转角度
        direction: 1, // 花瓣旋转方向 1: 顺时针, -1: 逆时针
        color: '#000', // 花瓣颜色
        speed: 1, // 花瓣旋转速度
        trail: 60, // 花瓣旋转时的拖影(百分比)
        shadow: false, // 花瓣是否显示阴影
        hwaccel: false, //spinner 是否启用硬件加速及高速旋转
        className: 'spinner', // spinner css 样式名称
        zIndex: 2e9, // spinner的z轴 (默认是2000000000)
        top: '35%', // spinner 相对父容器Top定位 单位 px
        left: '50%'// spinner 相对父容器Left定位 单位 px
    };

    var spinner = new Spinner(opts);

    var localUrl = 'http://localhost:22000';

    function setTable(team, player, obj) {
        if (obj == undefined) {obj = {}};
        obj.champion = '#p_s_t'+team+'_p'+player+'_champion';
        obj.name = '#p_s_t'+team+'_p'+player+'_name';
        obj.mmr = '#p_s_t'+team+'_p'+player+'_mmr';
        obj.league = '#p_s_t'+team+'_p'+player+'_league';
        obj.winLoss = '#p_s_t'+team+'_p'+player+'_winLoss';

        return obj;
    }

    var grid_team1_player1 = setTable(1,1);
    var grid_team1_player2 = setTable(1,2);
    var grid_team1_player3 = setTable(1,3);
    var grid_team1_player4 = setTable(1,4);
    var grid_team1_player5 = setTable(1,5);

    var grid_team2_player1 = setTable(2,1);
    var grid_team2_player2 = setTable(2,2);
    var grid_team2_player3 = setTable(2,3);
    var grid_team2_player4 = setTable(2,4);
    var grid_team2_player5 = setTable(2,5);


    $('#btn_hello' ).click(function(){
        var url = localUrl;
        $.ajax({
            type: 'GET',
            url: url ,
            success: function(result) {
                var path = '';
                var str = '';
                var catStr = '';
                var finalStr = '';
                for (var i in result) {
                    var name = result[i].replace(/\s+/g,"");
                    path = "resources/4.4.3/img/champion/" + name + "\.png";
                    str = "<img src=" + path + ">";
                    catStr = catStr + str;
                    finalStr = "<p>"+catStr+"</p>";
                }
                $( '#p_s_champs' ).html(finalStr);
            },
            error: function(jqXHR, status, error){
                $('#p_s_hello' ).append('hello world failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>');
            }
        });
    });


    function getSummonerInfo(inObj) {
        $.ajax({
            type: 'GET',
            url: localUrl + '/summoner/id',
            data: inObj,
            success: function(result) {
                //$( '#p_s_outputData' ).html("<b> summoner info: </b>" + JSON.stringify(result));
                //for (var i in result.summonerName) {
                //    if (result.summonerName[i].id) {
                //        $( '#p_s_idData' ).html(JSON.stringify(result[i].id));
                //    }
                //}
                var name = inObj.summonerName;
                //$( '#p_s_idData' ).html("<b> summoner id: </b>" + JSON.stringify(result[name].id));
                idObj.summonerId = result[name].id;

                // Retrieve summoner current game
                getSummonerCurrentGame(idObj);
            },
            error: function(jqXHR, status, error){
                // On fail
                spinner.stop();
                $('#p_s_logs' ).append('get summoner id info failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>'+'Try to refresh and check again');
            }
        });
    }

    function getSummonerCurrentGame(idObj) {

        count_load_rank = 0;

        $.ajax({
            type: 'GET',
            url: localUrl + '/summoner/currentgame' ,
            data: idObj,
            success: function(result) {
                if (result.ret == 1) {spinner.stop();$('#p_s_logs' ).html(JSON.stringify(result.result));}
                else {
                    //$( '#p_s_idData' ).html(JSON.stringify(result));
                    getSummonersByTeam( result.participants , function (team1 , team2) {
                        $( grid_team1_player1.name ).html( team1[0].summonerName );
                        getMMR( {summonerName : team1[0].summonerName} , grid_team1_player1 );
                        getChampionById( {championId : team1[0].championId} , grid_team1_player1 );
                        getSoloRecord( {summonerId : team1[0].summonerId} , grid_team1_player1 );

                        $( grid_team1_player2.name ).html( team1[1].summonerName );
                        getMMR( {summonerName : team1[1].summonerName} , grid_team1_player2 );
                        getChampionById( {championId : team1[1].championId} , grid_team1_player2 );
                        getSoloRecord( {summonerId : team1[1].summonerId} , grid_team1_player2 );

                        $( grid_team1_player3.name ).html( team1[2].summonerName );
                        getMMR( {summonerName : team1[2].summonerName} , grid_team1_player3 );
                        getChampionById( {championId : team1[2].championId} , grid_team1_player3 );
                        getSoloRecord( {summonerId : team1[2].summonerId} , grid_team1_player3 );

                        $( grid_team1_player4.name ).html( team1[3].summonerName );
                        getMMR( {summonerName : team1[3].summonerName} , grid_team1_player4 );
                        getChampionById( {championId : team1[3].championId} , grid_team1_player4 );
                        getSoloRecord( {summonerId : team1[3].summonerId} , grid_team1_player4 );

                        $( grid_team1_player5.name ).html( team1[4].summonerName );
                        getMMR( {summonerName : team1[4].summonerName} , grid_team1_player5 );
                        getChampionById( {championId : team1[4].championId} , grid_team1_player5 );
                        getSoloRecord( {summonerId : team1[4].summonerId} , grid_team1_player5 );

                        $( grid_team2_player1.name ).html( team2[0].summonerName );
                        getMMR( {summonerName : team2[0].summonerName} , grid_team2_player1 );
                        getChampionById( {championId : team2[0].championId} , grid_team2_player1 );
                        getSoloRecord( {summonerId : team2[0].summonerId} , grid_team2_player1 );

                        $( grid_team2_player2.name ).html( team2[1].summonerName );
                        getMMR( {summonerName : team2[1].summonerName} , grid_team2_player2 );
                        getChampionById( {championId : team2[1].championId} , grid_team2_player2 );
                        getSoloRecord( {summonerId : team2[1].summonerId} , grid_team2_player2 );

                        $( grid_team2_player3.name ).html( team2[2].summonerName );
                        getMMR( {summonerName : team2[2].summonerName} , grid_team2_player3 );
                        getChampionById( {championId : team2[2].championId} , grid_team2_player3 );
                        getSoloRecord( {summonerId : team2[2].summonerId} , grid_team2_player3 );

                        $( grid_team2_player4.name ).html( team2[3].summonerName );
                        getMMR( {summonerName : team2[3].summonerName} , grid_team2_player4 );
                        getChampionById( {championId : team2[3].championId} , grid_team2_player4 );
                        getSoloRecord( {summonerId : team2[3].summonerId} , grid_team2_player4 );

                        $( grid_team2_player5.name ).html( team2[4].summonerName );
                        getMMR( {summonerName : team2[4].summonerName} , grid_team2_player5 );
                        getChampionById( {championId : team2[4].championId} , grid_team2_player5 );
                        getSoloRecord( {summonerId : team2[4].summonerId} , grid_team2_player5 );

                        //getTeamBySummonerId({summonerId: team1[0].summonerId})
                    } );

                    //getMatch({matchId:result.gameId});

                }


            },
            error: function(jqXHR, status, error){
                spinner.stop();
                $('#p_s_logs' ).append('get summoner info failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>'+'Try to refresh and check again');
            }
        });
    }

    function getSoloRecord(idObj, table) {

        $.ajax({
            type: 'GET',
            url: localUrl + '/summoner/solo_record' ,
            data: idObj,
            success: function(result) {
                count_load_rank++;
                $( table.league ).html(result.tier + " " + result.entries[0].division+" ("+result.entries[0].leaguePoints+")");
                $( table.winLoss ).html(result.entries[0].wins + "/" + result.entries[0].losses);
                check_load_rank();
            },
            error: function(jqXHR, status, error){
                spinner.stop();
                $('#p_s_logs' ).append('get ranked solo failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>'+'Try to refresh and check again');
            }
        });
    }

    function getTeamRecord(idObj) {

        $.ajax({
            type: 'GET',
            url: localUrl + '/team/rank_record' ,
            data: idObj,
            success: function(result) {
                $( '#p_s_showData' ).html(JSON.stringify(result));
            },
            error: function(jqXHR, status, error){
                $('#p_s_logs' ).append('get team rank record failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>');
            }
        });
    }

    function getMatch(idObj) {

        $.ajax({
            type: 'GET',
            url: localUrl + '/match' ,
            data: idObj,
            success: function(result) {
                $( '#p_s_showData' ).html(JSON.stringify(result));
            },
            error: function(jqXHR, status, error){
                $('#p_s_logs' ).append('get team rank record failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>');
            }
        });
    }

    function getTeamBySummonerId(idObj) {

        $.ajax({
            type: 'GET',
            url: localUrl + '/team/by_summoner_id' ,
            data: idObj,
            success: function(result) {
                $( '#p_s_showData' ).html(JSON.stringify(result));
            },
            error: function(jqXHR, status, error){
                $('#p_s_logs' ).append('get team id info failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>');
            }
        });
    }

    function getChampionById(idObj, table) {

        $.ajax({
            type: 'GET',
            url: localUrl + '/champion/by_id' ,
            data: idObj,
            success: function(result) {
                $( table.champion ).html(JSON.stringify(result.name));
            },
            error: function(jqXHR, status, error){
                $('#p_s_logs' ).append('get champion info failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>');
            }
        });
    }

    function getMMR(nameObj,table) {
        $.ajax({
            type: 'GET',
            url: localUrl + '/mmr' ,
            data: nameObj,
            success: function(result) {
                $( table.mmr ).html(result.mmr);
            },
            error: function(jqXHR, status, error){
                $('#p_s_logs' ).append('get mmr failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>');
            }
        });
    }

    function check_load_rank() {
        if (count_load_rank == 10) {
            spinner.stop();
            $('#rankTable' ).show();
        }
        else {
            setTimeout(function(){
               check_load_rank();
            },2000)
        }
    }


    var idObj = {};
    $('#btn_getGame' ).click(function() {
        clearFiled();
        $('#rankTable' ).hide();
        var target = document.getElementById('p_s_spinner');
        spinner.spin(target);

        $('#p_s_champion_name' ).html('Champion');
        $('#p_s_summoner_name' ).html('Summoner');
        $('#p_s_summoner_mmr' ).html('MMR');
        $('#p_s_summoner_league' ).html('League');
        $('#p_s_summoner_winLoss' ).html('W/L');
        $('#p_s_champion_kda' ).html('KDA');
        $('#p_s_last20matches' ).html('Last 20 games');

        var inObj = {
            summonerName: $('#ipt_summonerName' ).val()
        }

        // Retrieve summoner info
        getSummonerInfo(inObj);
    });

    function clearFiled() {
        $('#p_s_logs' ).html('');
        $('#p_s_showData' ).html('');
        $('#p_s_mmr' ).html('');
        $('#p_s_idData' ).html('');
        $('#p_s_outputData' ).html('');
    }
});

function getSummonersByTeam(participants, next) {
    var team1 = [];
    var team2 = [];
    for (var i in participants) {
        if (participants[i].teamId == 100) {
            team1.push(participants[i]);
        }
        if (participants[i].teamId == 200) {
            team2.push(participants[i]);
        }
    }
    next(team1 ,  team2);
}
