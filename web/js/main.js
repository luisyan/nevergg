/**
 * Created by admin on 15-03-05.
 */
var staticDataVersion = '5.22.3';
var localDataVersion = '5.19.1';

$(document).ready(function() {

    var REGION = 'na';

    var myUrl = window.location.href;
    if (myUrl.indexOf('#') != -1 && myUrl.indexOf('&') != -1) {
        var name = myUrl.substring(myUrl.indexOf('#')+1, myUrl.indexOf('&'));
        REGION = myUrl.substring(myUrl.indexOf('=')+1, myUrl.length);

        $('#dropdown-main-region > ul > li' ).each(function() {
            if ($(this ).attr('region') == REGION) {
                $(this ).attr('class', 'am-active');
                $(this ).parent().parent().find('button' ).text(REGION.toUpperCase());
            }
        })

        $('#ipt_gameStatsSearch' ).val(name);
        setTimeout(startSearch, 500);
    }


    //initTable();

    var masteryList_AllPlayer = [[],[],[]];

    var statsX = 10;
    var statsY = -210;
    var Y_axis = -190;

    $('#loading_spinner' ).hide();
    $('#msg').hide();
    $('.separateLine' ).hide();
    $('#mid-bar-span' ).hide();
    $('#btn_getGame' ).hide();
    $('#btn_checkMMR' ).hide();
    //$('#btn_getFeaturedGames').hide(); // quickly get a player name for test purpose
    var count_load_rank = 0;
    var count_disable_sumbit = 0;
    var opts = {
        lines: 11, // 花瓣数目
        length: 8, // 花瓣长度
        width: 2, // 花瓣宽度
        radius: 10, // 花瓣距中心半径
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
        top: '60%', // spinner 相对父容器Top定位 单位 px
        left: '50%'// spinner 相对父容器Left定位 单位 px
    };

    var spinner = new Spinner(opts);

    var urlPrefix = '/api';

    function setTable(team, player, obj) {
        if (obj == undefined) {obj = {}};
        obj.team = team;
        obj.player = player;
        obj.championIcon = '#p_s_t'+team+'_p'+player+'_championIcon';
        obj.spell = '#p_s_t'+team+'_p'+player+'_spell';
        obj.champion = '#p_s_t'+team+'_p'+player+'_champion';
        obj.name = '#p_s_t'+team+'_p'+player+'_name';
        obj.mmr = '#p_s_t'+team+'_p'+player+'_mmr';
        obj.league = '#p_s_t'+team+'_p'+player+'_league';
        obj.promo = '#p_s_t'+team+'_p'+player+'_promo';
        obj.winLoss = '#p_s_t'+team+'_p'+player+'_winLoss';
        obj.KDA = '#p_s_t'+team+'_p'+player+'_KDA';
        obj.runes = '#p_s_t'+team+'_p'+player+'_runes';
        obj.mastery = '#p_s_t'+team+'_p'+player+'_mastery';
        obj.last10matches = '#p_s_t'+team+'_p'+player+'_last10matches';
        obj.matches_box = [];

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


    var runesCache = [[],[],[]];

    for (var i=1;i<3;i++) {
        for (var j=1;j<6;j++) {
            runesCache[i][j]=[];
        }
    }

    var t1_p1_stats = [];
    var t1_p2_stats = [];
    var t1_p3_stats = [];
    var t1_p4_stats = [];
    var t1_p5_stats = [];
    var t2_p1_stats = [];
    var t2_p2_stats = [];
    var t2_p3_stats = [];
    var t2_p4_stats = [];
    var t2_p5_stats = [];

    var stats_output = [[],[],[]];

    for (var i=1;i<3;i++) {
        for (var j=1;j<6;j++) {
            stats_output[i][j]={str:'loading'};
        }
    }

    var playerCache = [
        grid_team1_player1,
        grid_team1_player2,
        grid_team1_player3,
        grid_team1_player4,
        grid_team1_player5,
        grid_team2_player1,
        grid_team2_player2,
        grid_team2_player3,
        grid_team2_player4,
        grid_team2_player5
    ]



    //function initTable() {
    //    $('#table_team1' ).append('<tr><th class="tableHeader" colspan="3"><span id="p_s_champion_name"></span></th><th class="tableHeader"><span id="p_s_summoner_name"></span></th><th class="tableHeader"><span id="p_s_summoner_mmr"></span></th><th class="tableHeader"><span id="p_s_summoner_league"></span></th><th class="tableHeader"><span id="p_s_summoner_winLoss"></span></th><th class="tableHeader"><span id="p_s_champion_kda"></span></th><th class="tableHeader"><span id="p_s_runes"></span></th><th class="tableHeader"><span id="p_s_mastery"></span></th><th class="tableHeader"><span id="p_s_last10matches"></span></th></tr><tr><td class="separateLine" id="lineTop" colspan="11"></td></tr>')
    //    for (var i=1;i<6;i++) {
    //        $('#table_team1' ).append('<tr><td><span id="p_s_t1_p'+i+'_championIcon"></span></td><td><span id="p_s_t1_p'+i+'_spell"></span></td><td><span id="p_s_t1_p'+i+'_champion"></span></td><td><span class="span_playerName" id="p_s_t1_p'+i+'_name"></span></td><td><span id="p_s_t1_p'+i+'_mmr"></span></td><td class="league"><span id="p_s_t1_p'+i+'_league"></span><p id="p_s_t1_p'+i+'_promo" class="promoIconArea"></p></td><td><span id="p_s_t1_p'+i+'_winLoss"></span></td><td><span id="p_s_t1_p'+i+'_KDA"></span></td><td><span id="p_s_t1_p'+i+'_runes"></span></td><td class="td_mastery"><span id="p_s_t1_p'+i+'_mastery"></span></td><td class="tenGames"><span id="p_s_t1_p'+i+'_last10matches"></span></td><td></td><td></td></tr>')
    //    }
    //
    //    for (var j=1;j<6;j++) {
    //        $('#table_team2' ).append('<tr><td><span id="p_s_t2_p'+j+'_championIcon"></span></td><td><span id="p_s_t2_p'+j+'_spell"></span></td><td><span id="p_s_t2_p'+j+'_champion"></span></td><td><span class="span_playerName" id="p_s_t2_p'+j+'_name"></span></td><td><span id="p_s_t2_p'+j+'_mmr"></span></td><td class="league"><span id="p_s_t2_p'+j+'_league"></span><p id="p_s_t2_p'+j+'_promo" class="promoIconArea"></p></td><td><span id="p_s_t2_p'+j+'_winLoss"></span></td><td><span id="p_s_t2_p'+j+'_KDA"></span></td><td><span id="p_s_t2_p'+j+'_runes"></span></td><td class="td_mastery"><span id="p_s_t2_p'+j+'_mastery"></span></td><td class="tenGames"><span id="p_s_t2_p'+j+'_last10matches"></span></td><td></td><td></td></tr>')
    //    }
    //    $('#table_team2' ).append('<tr><td class="separateLine" id="lineBottom" colspan="11"></td></tr>')
    //}


    $('#region-select-main > div > button' ).on('click', function(){
        $('#dropdown-main-region' ).dropdown({
            justify: '#region-select-main'
        })
    })

    $('#dropdown-main-region > ul > li' ).on('click', function() {
        $(this ).attr('class', 'am-active');
        $(this ).siblings().removeAttr('class');
        REGION = $(this ).attr('region');
        $(this ).parent().parent().find('button' ).text(REGION.toUpperCase());
        $('#dropdown-main-region' ).dropdown('close');
    })

    function getFeaturedGames() {
        $.ajax({
            type: 'GET',
            url: urlPrefix + '/featuredGames' ,
            success: function(result) {
                ShowSuccess('Got featured games');
                var game = result.gameList[0];
                var players = game.participants;
                var firstPlayer = players[0].summonerName;
                $('#ipt_gameStatsSearch' ).val(firstPlayer);
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting featured games failed');
            }
        });
    }


    $('#btn_getFeaturedGames' ).click(getFeaturedGames);

    $('#btn_hello' ).click(function(){
        var url = urlPrefix;
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
            url: urlPrefix + '/summoner/id',
            data: inObj,
            success: function(result) {
                if (result.ret == 1) {
                    ShowFailure('Summoner does not exist');
                    $.AMUI.progress.done();
                    $('#loading_spinner' ).hide();
                    recover();
                } else {
                    idObj.summonerId = result.id;
                    idObj.region = REGION;
                    getSummonerCurrentGame(idObj);
                }
            },
            error: function(jqXHR, status, error){
                $('#loading_spinner' ).hide();
                $.AMUI.progress.done();
                ShowFailure('Getting summoner id info failed, try to refresh and check again');
            }
        });
    }

    function getSummonerCurrentGame(idObj) {
        $.ajax({
            type: 'GET',
            url: urlPrefix + '/summoner/currentgame' ,
            data: idObj,
            success: function(result) {
                if (result.ret == 1) {
                    $.AMUI.progress.done();
                    $('#loading_spinner' ).hide();
                    ShowFailure(result.result);
                    recover();
                }
                else {
                    getSummonersByTeam( result.participants, function (team1, team2) {
                        getTheRestData(team1 ,  team2);
                    });
                }
            },
            error: function(jqXHR, status, error){
                $('#loading_spinner' ).hide();
                ShowFailure('From 1st key..get summoner info failed, try to refresh and check again');
            }
        });
    }


    function getSoloRecord(idObj, table) {
        idObj.region = REGION;

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/summoner/solo_record' ,
            data: idObj,
            success: function(result) {
                var tierPath = "../tier/";
                if (result.ret == 1) {
                    var fileName = "unknown.png";
                } else {
                    var fileName = result.tier + "_" + result.entries[0].division+".png";

                    if (result.entries[0].miniSeries) {
                        //$(table.promo ).html('<a style="position: relative; bottom: -1px" class="am-icon-level-up"></a>'+' : ');
                        //$(table.promo ).append(JSON.stringify(result.entries[0].miniSeries));

                        var progress = result.entries[0].miniSeries.progress;
                        var numMatch = progress.length;
                        for (var i=0; i < numMatch; i++) {
                            if (progress.charAt(i) == 'W') $(table.promo ).append('<img class="promotionIcon" src="icon/passIcon.png"/>');
                            else if (progress.charAt(i) == 'L') $(table.promo ).append('<img class="promotionIcon" src="icon/failIcon.png"/>');
                            else if (progress.charAt(i) == 'N') $(table.promo ).append('<img class="promotionIcon" src="icon/undetermined.png"/>');
                        }
                    }
                }
                var tierFile = tierPath+fileName;
                if (result.ret != 1) {
                    var lowerCase = result.tier.toLowerCase();
                    var fixedTier = result.tier.charAt(0)+lowerCase.substr(1, lowerCase.length-1);
                    $( table.league ).html("<img src="+tierFile+" align='middle' width='33' height='33'/> <span style='0px; font-size: 14px'><span league-tier-responsive>"+fixedTier+ "</span> " + result.entries[0].division+" ("+result.entries[0].leaguePoints+")</span>");
                    $( table.winLoss ).html(result.entries[0].wins + "/" + result.entries[0].losses);
                } else {
                    $( table.league ).html("<img src="+tierFile+" align='middle' width='33' height='33'/><span league-tier-responsive> "+"UNRANKED</span>");
                    $( table.winLoss ).html("0/0");
                }
            },
            error: function(jqXHR, status, error){
                $('#loading_spinner' ).hide();
                ShowFailure('Getting ranked solo info failed (key 1)');
            }
        });
    }

    function getSoloRecord_2(idObj, table) {
        idObj.region = REGION;

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/summoner/solo_record_2' ,
            data: idObj,
            success: function(result) {
                count_load_rank++;
                var tierPath = "../tier/";
                if (result.ret == 1) {
                    var fileName = "unknown.png";
                } else {
                    var fileName = result.tier + "_" + result.entries[0].division+".png";

                    if (result.entries[0].miniSeries) {
                        //$(table.promo ).html('<a style="position: relative; bottom: -1px" class="am-icon-level-up"></a>'+' : ');
                        //$(table.promo ).append(JSON.stringify(result.entries[0].miniSeries));

                        var progress = result.entries[0].miniSeries.progress;
                        var numMatch = progress.length;
                        for (var i=0; i < numMatch; i++) {
                            if (progress.charAt(i) == 'W') $(table.promo ).append('<img class="promotionIcon" src="icon/passIcon.png"/>');
                            else if (progress.charAt(i) == 'L') $(table.promo ).append('<img class="promotionIcon" src="icon/failIcon.png"/>');
                            else if (progress.charAt(i) == 'N') $(table.promo ).append('<img class="promotionIcon" src="icon/undetermined.png"/>');
                        }
                    }
                }
                var tierFile = tierPath+fileName;
                if (result.ret != 1) {
                    var lowerCase = result.tier.toLowerCase();
                    var fixedTier = result.tier.charAt(0)+lowerCase.substr(1, lowerCase.length-1);
                    $( table.league ).html("<img src="+tierFile+" align='middle' width='33' height='33'/> <span style='0px; font-size: 14px'><span league-tier-responsive>"+fixedTier+ "</span> " + result.entries[0].division+" ("+result.entries[0].leaguePoints+")</span>");
                    $( table.winLoss ).html(result.entries[0].wins + "/" + result.entries[0].losses);
                } else {
                    $( table.league ).html("<img src="+tierFile+" align='middle' width='33' height='33'/><span league-tier-responsive> "+"UNRANKED</span>");
                    $( table.winLoss ).html("0/0");
                }
            },
            error: function(jqXHR, status, error){
                $('#loading_spinner' ).hide();
                ShowFailure('Getting ranked solo info failed (key 2)');
            }
        });
    }





    function getRank(idObj, table, team) {
        if (team == 'team1') {
            getSoloRecord(idObj, table);
        }
        if (team == 'team2') {
            getSoloRecord(idObj, table);
        }
    }

    function getTeamRecord(idObj) {

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/team/rank_record' ,
            data: idObj,
            success: function(result) {
                $( '#p_s_showData' ).html(JSON.stringify(result));
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting team rank record failed');
            }
        });
    }

    function getMatch(idObj) {

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/match' ,
            data: idObj,
            success: function(result) {
                $( '#p_s_showData' ).html(JSON.stringify(result));
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting match record failed');
            }
        });
    }

    function getTeamBySummonerId(idObj) {

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/team/by_summoner_id' ,
            data: idObj,
            success: function(result) {
                $( '#p_s_showData' ).html(JSON.stringify(result));
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting team by summoner id info failed');
            }
        });
    }

    function getChampionFromDB(idObj, table) {

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/db/champion' ,
            data: idObj,
            success: function(result) {
                count_load_rank++;
                var name = result.name;
                var iconName = result.iconName;
                var htmlName = '<span class="am-sans-serif" champion-name-responsive>'+name+'</span>'

                $( table.champion ).html(htmlName);
                var getFromFile = false; // not getting from local file
                if (getFromFile == true) {
                    var championIconPath = "'../resources/"+localDataVersion+"/img/champion/";
                    var fileName = championName + ".png'";
                    var iconUrl = championIconPath + fileName;
                } else {
                    var iconUrl = 'http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/champion/'+iconName;
                }
                var htmlCode = '<img src='+iconUrl+' width="40" height="40" champion-icon-responsive/>';

                $( table.championIcon ).html(htmlCode);

                check_load_rank();
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting champion from db failed');
            }
        });


    }


    function getChampionById(idObj, table) {

        getChampionFromFile(idObj.championId, function(champion) {
            var name = champion.name.toString();
            var iconName = champion.image.full;
            var htmlName = '<span class="am-sans-serif">'+name+'</span>'

            $( table.champion ).html(htmlName);
            var getFromFile = false; // not getting from local file
            if (getFromFile == true) {
                var championIconPath = "'../resources/"+localDataVersion+"/img/champion/";
                var fileName = championName + ".png'";
                var iconUrl = championIconPath + fileName;
            } else {
                var iconUrl = 'http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/champion/'+iconName;
            }
            var htmlCode = "<img src="+iconUrl+" width='40' height='40'/>";

            $( table.championIcon ).html(htmlCode);

            check_load_rank();
        });
    }

    function fixChampionName(name) {
        if (name == 'Wukong') {name = 'MonkeyKing';} //wukong's icon file name
        if (name == 'Fiddlesticks') {name = 'FiddleSticks';} //fiddle's icon file name
        if (name == 'LeBlanc') {name = 'Leblanc';} //Leblanc's icon file name
        if (name == 'Dr. Mundo') {name = 'DrMundo';}
        if (name == 'ChoGath') {name = 'Chogath';}
        if (name == 'KhaZix') {name = 'Khazix';}

        return name;
    }

    function drawSpellIcon(spell1Id, spell2Id, table) {

        getSpellFromDB(spell1Id, function(spell) {
            var getFromFile = false;
            if (getFromFile == true) {
                var championIconPath = "'../resources/"+localDataVersion+"/img/spell/";
                var fileName = spell.image;
                var iconUrl = championIconPath + fileName;
            } else {
                var iconUrl = 'http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/spell/' + spell.image;
            }
            var htmlCode = "<img src="+iconUrl+" width='20' height='20' spell-responsive/>";
            $( table.spell ).append(htmlCode);

            getSpellFromDB(spell2Id, function(spell) {
                var getFromFile = false;
                if (getFromFile == true) {
                    var championIconPath = "'../resources/"+localDataVersion+"/img/spell/";
                    var fileName = spell.image;
                    var iconUrl = championIconPath + fileName;
                } else {
                    var iconUrl = 'http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/spell/' + spell.image;
                }
                var htmlCode = "<img src="+iconUrl+" width='20' height='20' spell-responsive spell-right/>";
                $( table.spell ).append(htmlCode);

            });

        });
    }



    function getRankStats(idObj, championId, table) {
        idObj.region = REGION;
        $.ajax({
            type: 'GET',
            url: urlPrefix + '/rank/stats' ,
            data: idObj,
            success: function(result) {
                if (result.ret == 1) {
                    $( table.KDA ).html("unknown");
                    $( table.champion ).append(" (0)");
                } else {
                    calculateKDA(championId, result, function(averageKDA, seasonStats) {
                        $( table.KDA ).html('<span style="color: #00aa00">'+averageKDA.averageKill+'</span>-<span style="color: #ff0000">'+averageKDA.averageDeath+'</span>-<span style="color: goldenrod">'+averageKDA.averageAssist+'</span>');
                        $( table.champion ).append(seasonStats);
                    })
                }
                count_disable_sumbit++;
                check_disable_submit();
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting rank stats failed');
            }
        });
    }

    function getMMR(nameObj,table) {
        $.ajax({
            type: 'GET',
            url: urlPrefix + '/mmr' ,
            data: nameObj,
            success: function(result) {
                if (result.error != true) {
                    $( table.mmr ).html(result.mmr);
                } else {
                    $( table.mmr ).html("unknown");
                }
            },
            error: function(jqXHR, status, error){
                ShowFailure('Get mmr failed');
            }
        });
    }

    function getPlayerSummary(idObj) {

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/summoner/summary' ,
            data: idObj,
            success: function(result) {
                $( '#p_s_showData' ).html(JSON.stringify(result));
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting player summary failed');
            }
        });
    }

    function getMatchHistory(idObj, table, stats, output) {
        idObj.region = REGION;

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/summoner/matchHistory' ,
            data: idObj,
            success: function(result) {
                getAllMatches(result.matches, idObj, table, stats, output);
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting entire match history failed');
            }
        });
    }

    function getAllMatches(matches, idObj, table, stats, output) {
        for (var i in matches) {
            $.ajax({
                type: 'GET',
                url: urlPrefix + '/summoner/matchHistoryDetails' ,
                data: {matchId: matches[i].matchId},
                success: function(result) {
                    table.matches_box.push(result);
                    if (table.matches_box.length == 10) getMatchHistoryDetails(table.matches_box, idObj, table, stats, output);
                },
                error: function(jqXHR, status, error){
                    ShowFailure('Getting single match details failed');
                }
            });
        }
    }


    function getMatchHistoryDetails(matches, idObj, table, stats, output) {
                var tierPath = "../tier/";
                if (matches == undefined) {
                    var fileName = "unknown.png";
                } else {
                    var highestTier = matches[0].participants[0].highestAchievedSeasonTier;
                    if (highestTier == 'UNRANKED') {
                        var fileName = "unknown.png";
                    } else {
                        var fileName = highestTier + "_I.png";
                    }
                }
                var tierFile = tierPath+fileName;
                $(table.league ).popover({
                    content: '<span class="rank-popover" style="color:#000000; font-size: 11px; padding-bottom: 0px">Previous:  <img src="'+tierFile+'" width="29px" height="29px"/></span>',
                    trigger: 'hover',
                    placement: 'top',
                    animation: true,
                    html: true
                });
                $('.rank-popover' ).parent().css('background-color','#ffffff');
                $('.rank-popover' ).parent().css('border-color','#ffffff')

                    analysisMatchHistory(matches, function(winner_count, loser_count) {
                        var output = winner_count + "-" + loser_count;
                        $(table.last10matches ).html(output);

                    })
                    $(table.name ).attr('team',table.team);
                    $(table.name ).attr('player',table.player);
                    if (stats) {makeStatsDataFromDB(matches, stats, output);}

    }



    function check_load_rank() {
        if (count_load_rank == 10) {
            $.AMUI.progress.done();
            $('#loading_spinner' ).hide();
            $('#msg' ).show();
            $('#rankTable' ).show();
            $('.separateLine' ).show();
            $('#mid-bar-span').show();
        }
        else {
            setTimeout(function(){
               check_load_rank();
            },2000)
        }
    }

    function check_disable_submit() {
        if (count_disable_sumbit == 10) {
            recover();
            count_disable_sumbit = 0;
        }
    }

    function calculateKDA(championId, data, callback) {
        var exist = false;
        var thisChampion = {};
        var gamePlayed = 0;
        var totalKill = 0;
        var totalDeath = 0;
        var totalAssist = 0;
        var averageKDA = {};

        for (var i in data) {
            if (championId == data[i].id) {
                exist = true;
                thisChampion = data[i];
            }
        }
        if (exist == false) {
            averageKDA.averageKill = 0;
            averageKDA.averageDeath = 0;
            averageKDA.averageAssist = 0;
            var seasonStats = ' (0)';
            callback(averageKDA, seasonStats);
            return;
        };

        gamePlayed = Number(thisChampion.stats.totalSessionsPlayed);
        totalKill = Number(thisChampion.stats.totalChampionKills);
        totalDeath = Number(thisChampion.stats.totalDeathsPerSession);
        totalAssist = Number(thisChampion.stats.totalAssists);

        averageKDA.averageKill = (totalKill/gamePlayed).toFixed(1);
        averageKDA.averageDeath = (totalDeath/gamePlayed).toFixed(1);
        averageKDA.averageAssist = (totalAssist/gamePlayed).toFixed(1);

        var seasonWon = Number(thisChampion.stats.totalSessionsWon);
        var seasonLoss = Number(thisChampion.stats.totalSessionsLost);
        var wonPlusLoss = seasonWon+seasonLoss;
        var winRate = (seasonWon/(seasonWon+seasonLoss)).toFixed(2);
        var winRateOut = '';
        if (winRate > 0 && winRate < 1) {winRateOut = winRate.slice(2,4);}
	    if (winRate == 1) {winRateOut = '100';}
        if (seasonWon == 0) {winRateOut = '0';}

        if (winRateOut > 69 ) {
            winRateOut = '<span style="color: red">'+winRateOut+'%</span>'
        } else if (winRateOut > 49 && winRateOut < 70) {
            winRateOut = '<span style="color: darkorange">'+winRateOut+'%</span>'
        } else if (winRateOut < 50) {
            winRateOut = '<span style="color: green">'+winRateOut+'%</span>'
        }
        var seasonStats = " " + winRateOut + " ("+wonPlusLoss+")";

        callback(averageKDA, seasonStats);
    }

    function analysisMatchHistory(data, callback) {
        var winner_count = 0;
        var loser_count = 0;
        for (var i in data) {
            if (data[i].participants[0].stats.winner) {
                winner_count++;
            }
            else {loser_count++;};
        }
        callback(winner_count, loser_count);
    }

    var $btn;
    var idObj = {};
    $('#btn_getGame' ).click(startSearch);


    function startSearch() {

        //NProgress.configure({ showSpinner: true });

        var opt =   {
            minimum: 0.08,
            easing: 'ease',
            positionUsing: '',
            speed: 200,
            trickle: true,
            trickleRate: 0.02,
            trickleSpeed: 800,
            showSpinner: false,
            barSelector: '[role="nprogress-bar"]',
            spinnerSelector: '[role="nprogress-spinner"]',
            parent: 'body',
            template: '<div style="background-color: limegreen;height: 3px;position: absolute;top: 22px;" class="nprogress-bar" role="nprogress-bar">' +
            '<div style="position: absolute;top: -100px;" class="nprogress-peg"></div></div>' +
            '<div style="position: absolute;left: 50%; top: 300px;" class="nprogress-spinner" role="nprogress-spinner">' +
            '<div class="nprogress-spinner-icon"></div></div>'
        }

        $.AMUI.progress.configure(opt);
        $.AMUI.progress.start();


        $('#btn_getGame').val( 'searching..' );
        $('#btn_getGame').attr('disabled' , 'disabled' );

        $btn = $('#getGame')
        $btn.button('loading');


        clearFiled();
        clearTable();
        $('#rankTable' ).hide();
        //var target = document.getElementById('p_s_spinner');
        //spinner.spin(target);
        $('#loading_spinner' ).show();

        $('#p_s_champion_name' ).html('Champion');
        $('#p_s_summoner_name' ).html('Summoner');
        //$('#p_s_summoner_mmr' ).html('MMR');
        $('#p_s_summoner_league' ).html('League');
        $('#p_s_summoner_winLoss' ).html('W/L');
        $('#p_s_champion_kda' ).html('KDA');
        $('#p_s_runes' ).html('Runes');
        $('#p_s_last10matches' ).html('Last 10');
        $('#p_s_mastery' ).html('Mastery');

        for (var i=1;i<3;i++) {
            for (var j=1;j<6;j++) {
                var fieldName = '#p_s_t'+i+'_p'+j+'_runes';
                $(fieldName ).html('<img style="position: relative; left: 2px" src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/rune/8001.png" align="middle" width="30" height="30"/>');
            }
        }
        var inObj = {
            summonerName: $('#ipt_gameStatsSearch' ).val(),
            region: REGION
        }

        // Retrieve summoner info
        getSummonerInfo(inObj);
        var currentUrl = window.location.href;
        if (currentUrl.indexOf('#') != -1) {
            currentUrl = currentUrl.substring(0, currentUrl.indexOf('#')+1);
            currentUrl = currentUrl+inObj.summonerName+'&region='+REGION;
        } else {
            currentUrl = currentUrl.substring(0, currentUrl.indexOf('main.html')+10);
            currentUrl = currentUrl+'#'+inObj.summonerName;
        }
        if (history && history.pushState) {
            history.pushState(null, document.title, currentUrl);
        }

    }



    $('#btn_checkMMR' ).click(function(){
        $('#mmr_loading_words').show();
        $('#mmr_loading_spin').show();
        $('#mmr_result').html('');
        var inObj = {
            summonerName: $('#ipt_checkMMR' ).val()
        }

        $.ajax({
            type: 'GET',
            url: urlPrefix + '/mmr',
            data: inObj ,
            success: function(result) {
                if (result.error == true) {
                    //$( '#p_s_showMMR' ).html("Your MMR is undetermined, you may not have played enough rank games recently");
                    ShowWarn("Your MMR is undetermined, you may not have played enough rank games recently");
                }
                else {
                    var mmr = result.mmr;
                    var output = mmr.replace(',','')
                    $('#mmr_loading_words').hide();
                    $('#mmr_loading_spin').hide();
                    $('#mmr_result').html("<br><br><p class='am-serif' style='font-size: 25px'>Your MMR is: " + output + "</p><br>");
                }
            },
            error: function(jqXHR, status, error){
                ShowFailure('Check mmr failed');
            }
        });
    });

    $('#btn_show' ).click(function(){
        $('#rankTable').toggle();

    });

    $("#ipt_gameStatsSearch").keydown(function() {
        if (event.keyCode == "13") {
            if ($('#btn_getGame' ).attr('disabled') != 'disabled') {
                $('#btn_getGame').click();
            }
        }
    });
    $("#ipt_checkMMR").keydown(function() {
        if (event.keyCode == "13") {
            $('#btn_checkMMR').click();
        }
    });

    function clearFiled() {
        count_load_rank = 0;
        $('#p_s_feedbackInfo' ).html('');
        $('#p_s_showData' ).html('');
        $('#p_s_mmr' ).html('');
        $('#p_s_idData' ).html('');
        $('#p_s_outputData' ).html('');
        $('#msg' ).hide();
        $('.separateLine' ).hide();
        $('#mid-bar-span').hide();
        $('.promoIconArea' ).html('');
    }

    function getChampionFromFile(championId, callback) {
        var champion = {};
        $.getJSON('../resources/'+localDataVersion+'/data/en_US/champion.json', function(result){
            var championList = result.data;
            for (var i in championList) {
                if (championList[i].key == championId) {
                    champion = championList[i];
                    break;
                }
            }
            callback(champion);
        });
    }

    function getSpellFromFile(spellId, callback) {
        var spell = {};
        $.getJSON('../resources/'+localDataVersion+'/data/en_US/summoner.json', function(result){
            var spellList = result.data;
            for (var i in spellList) {
                if (spellList[i].key == spellId) {
                    spell = spellList[i];
                    break;
                }
            }
            callback(spell);
        });
    }

    function getSpellFromDB(spellId, callback) {
        var inObj = {
            spellId: spellId
        }
        $.ajax({
            type: 'GET',
            url: urlPrefix + '/db/spell',
            data: inObj ,
            success: function(result) {
                callback(result);
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting summoner spell from db failed');
            }
        });
    }

    function fixName(name){
        var removeSpace = name.replace(/\s+/g,"");
        var removeUpperDot= removeSpace.replace("'","");
        var removeDot= removeUpperDot.replace("'","");
        return removeDot;
    }

    // --------------------------------------------- Mastery Tree -----------------------------------------------------------------------

    function getMastery(playerMasteryList, table) {
        var mastery = classifyMastery(playerMasteryList, table);
        masteryList_AllPlayer[table.team][table.player] = playerMasteryList;
        var htmlCode = '<button style="font-size: 13.5px; padding-left: 10px; padding-right: 10px; padding-top: 2px; padding-bottom: 0px" class="am-btn am-btn-secondary am-round" data-am-modal="{target: '+"'#masteryTreeWindow'"+', closeViaDimmer: 1, width: 827, height: 479}">'+mastery.btnMark+'</button>';
        $( table.mastery ).html(htmlCode);
        $(table.mastery ).attr('team',table.team);
        $(table.mastery ).attr('player',table.player);
        $(table.mastery ).attr('offense',mastery.offense);
        $(table.mastery ).attr('defense',mastery.defense);
        $(table.mastery ).attr('utility',mastery.utility);
    }


    function clearMasteryTree() {
        $('#masteryTree' ).find('.mastery-available' ).removeClass('mastery-available');
    }

    function addZeros() {
        $('.mastery' ).not('.mastery-available' ).find('span' ).text('0');
    }


    $('.td_mastery > span' ).on('click', function() {
        clearMasteryTree();
        var team = $(this ).attr('team');
        var player = $(this ).attr('player');
        var playerMasteryList = masteryList_AllPlayer[team][player];
        for (var i in playerMasteryList) {
            var id = playerMasteryList[i].masteryId;
            var multiplier = playerMasteryList[i].rank;
            var spanName = '#m_'+id;
            $(spanName ).text(multiplier);
            var div_name = '#mastery-'+id;
            $(div_name ).addClass('mastery-available');
            addZeros();
            $('#offense_total' ).text($(this ).attr('offense'));
            $('#defense_total' ).text($(this ).attr('defense'));
            $('#util_total' ).text($(this ).attr('utility'));
        }
    });


    function classifyMastery(playerMasteryList) {
        var offense = 0;
        var defense = 0;
        var util = 0;
        var masteryTotal = {};
        for (var i in playerMasteryList) {
            var masteryId = playerMasteryList[i].masteryId;
            var masteryIdNumber = Number(masteryId);
            if (masteryIdNumber > 6100 && masteryIdNumber < 6200) {offense = offense + Number(playerMasteryList[i].rank);}
            if (masteryIdNumber > 6300) {defense = defense + Number(playerMasteryList[i].rank);}
            if (masteryIdNumber > 6200 && masteryIdNumber < 6300) {util = util + Number(playerMasteryList[i].rank);}
        }
        masteryTotal.offense = offense;
        masteryTotal.defense = defense;
        masteryTotal.utility = util;
        masteryTotal.btnMark = offense+'/'+defense+'/'+util;
        return masteryTotal;
    }


    function clearTable() {
        clearRows( grid_team1_player1);
        clearRows( grid_team1_player2);
        clearRows( grid_team1_player3);
        clearRows( grid_team1_player4);
        clearRows( grid_team1_player5);

        clearRows( grid_team2_player1);
        clearRows( grid_team2_player2);
        clearRows( grid_team2_player3);
        clearRows( grid_team2_player4);
        clearRows( grid_team2_player5);

        for (var i=1;i<3;i++) {
            for (var j=1;j<6;j++) {
                runesCache[i][j]=[];
            }
        }
    }

    function clearRows(obj) {
        $(obj.championIcon).html('');
        $(obj.spell).html('');
        $(obj.champion).html('');
        $(obj.name).html('');
        $(obj.mmr).html('');
        $(obj.league).html('');
        $(obj.winLoss).html('');
        $(obj.KDA).html('');
        $(obj.last10matches).html('');
        $(obj.mastery).html('');
    }


    function recover() {
        $('#btn_getGame').val('Search');
        $('#btn_getGame').removeAttr('disabled');
        $btn.button('reset');
    }

    //------------------------------------------------- Individual stats ------------------------------------------------------

    function makeStatsDataFromFile(data, field, out) {
        $.getJSON('../resources/'+localDataVersion+'/data/en_US/champion.json', function(result){
            var championList = result.data;
            for (var j in data) {
                for (var i in championList) {
                    var championId = data[j].participants[0].championId;
                    var stats = data[j].participants[0].stats;
                    if (championList[i].key == championId) {
                        var nameToFix = championList[i].name.toString();
                        nameToFix = fixChampionName(nameToFix);
                        var championName = fixName(nameToFix);

                        if (championName == 'Wukong') {championName = 'MonkeyKing';} //wukong's icon file name
                        if (championName == 'Fiddlesticks') {championName = 'FiddleSticks';} //fiddle's icon file name
                        if (championName == 'LeBlanc') {championName = 'Leblanc';} //Leblanc's icon file name
                        if (championName == 'Dr. Mundo') {championName = 'DrMundo';}
                        if (championName == 'ChoGath') {championName = 'Chogath';}
                        if (championName == 'KhaZix') {championName = 'Khazix';}

                        var getFromFile = false; // not getting from local file
                        if (getFromFile == true) {
                            var championIconPath = "'../resources/"+localDataVersion+"/img/champion/";
                            var fileName = championName + ".png'";
                            var iconUrl = championIconPath + fileName;
                        } else {
                            var iconName = championList[i].image.full;
                            var iconUrl = 'http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/champion/'+iconName;
                        }
                        var htmlCode = "<img src="+iconUrl+" width='30' height='30'/>";
                        if (stats.winner == true) {var bgColor = '#CEF6D8';}
                        else {var bgColor = '#F5A9BC';}

                        if (getFromFile == true) {
                            if (stats.item0 != 0) {var i0 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item0+'.png" align="middle" width="20" height="20">';} else {i0 = ''}
                            if (stats.item1 != 0) {var i1 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item1+'.png" align="middle" width="20" height="20">';} else {i1 = ''}
                            if (stats.item2 != 0) {var i2 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item2+'.png" align="middle" width="20" height="20">';} else {i2 = ''}
                            if (stats.item3 != 0) {var i3 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item3+'.png" align="middle" width="20" height="20">';} else {i3 = ''}
                            if (stats.item4 != 0) {var i4 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item4+'.png" align="middle" width="20" height="20">';} else {i4 = ''}
                            if (stats.item5 != 0) {var i5 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item5+'.png" align="middle" width="20" height="20">';} else {i5 = ''}
                        } else {
                            if (stats.item0 != 0) {var i0 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item0+'.png" align="middle" width="20" height="20">';} else {i0 = ''}
                            if (stats.item1 != 0) {var i1 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item1+'.png" align="middle" width="20" height="20">';} else {i1 = ''}
                            if (stats.item2 != 0) {var i2 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item2+'.png" align="middle" width="20" height="20">';} else {i2 = ''}
                            if (stats.item3 != 0) {var i3 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item3+'.png" align="middle" width="20" height="20">';} else {i3 = ''}
                            if (stats.item4 != 0) {var i4 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item4+'.png" align="middle" width="20" height="20">';} else {i4 = ''}
                            if (stats.item5 != 0) {var i5 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item5+'.png" align="middle" width="20" height="20">';} else {i5 = ''}
                        }


                        var matchType = data[j].queueType;
                        var fixedType = matchType.replace(/_/g," ");

                        var fixedFinal = fixedType.substring(0, fixedType.indexOf('x')-1) + fixedType.substring(fixedType.indexOf('x')+2);
                        fixedFinal = ''; //remove game type for now since all games are RANKED SOLO

                        field[j] = '<p style="font-size: 70%;border-radius:5px; filter: alpha+(Opacity=80);-moz-opacity:0.8; opacity:2; cellspacing:0px; line-height: 8px; padding: 5px; margin: 5px;height: 40; test-align: center; background-color: '+bgColor+'">' + htmlCode + '&nbsp;' + fixedFinal + '&nbsp;' + stats.kills + '/' + stats.deaths + '/' + stats.assists + '&nbsp;'+i0+i1+i2+i3+i4+i5+ '</p>';
                    }
                }
                if (j == data.length-1) {
                    extractStats(field , out);
                }
            }
        });
    }


    function makeStatsDataFromDB(data, field, out) {
        $.ajax({
            type: 'GET',
            url: urlPrefix + '/db/champion/all/icon' ,
            success: function(result) {
                var championList = result;
                for (var j in data) {
                    for (var i in championList) {
                        var championId = data[j].participants[0].championId;
                        var stats = data[j].participants[0].stats;
                        if (championList[i].key == championId) {

                            var getFromFile = false; // not getting from local file
                            if (getFromFile == true) {
                                var championIconPath = "'../resources/"+localDataVersion+"/img/champion/";
                                var fileName = championList[i].image.full;
                                var iconUrl = championIconPath + fileName;
                            } else {
                                var iconName = championList[i].image.full;
                                var iconUrl = 'http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/champion/'+iconName;
                            }
                            var htmlCode = "<img src="+iconUrl+" width='30' height='30'/>";
                            if (stats.winner == true) {var bgColor = '#CEF6D8';}
                            else {var bgColor = '#F5A9BC';}

                            if (getFromFile == true) {
                                if (stats.item0 != 0) {var i0 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item0+'.png" align="middle" width="20" height="20">';} else {i0 = ''}
                                if (stats.item1 != 0) {var i1 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item1+'.png" align="middle" width="20" height="20">';} else {i1 = ''}
                                if (stats.item2 != 0) {var i2 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item2+'.png" align="middle" width="20" height="20">';} else {i2 = ''}
                                if (stats.item3 != 0) {var i3 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item3+'.png" align="middle" width="20" height="20">';} else {i3 = ''}
                                if (stats.item4 != 0) {var i4 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item4+'.png" align="middle" width="20" height="20">';} else {i4 = ''}
                                if (stats.item5 != 0) {var i5 = '<img src="../resources/'+localDataVersion+'/img/item/'+stats.item5+'.png" align="middle" width="20" height="20">';} else {i5 = ''}
                            } else {
                                if (stats.item0 != 0) {var i0 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item0+'.png" align="middle" width="20" height="20">';} else {i0 = ''}
                                if (stats.item1 != 0) {var i1 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item1+'.png" align="middle" width="20" height="20">';} else {i1 = ''}
                                if (stats.item2 != 0) {var i2 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item2+'.png" align="middle" width="20" height="20">';} else {i2 = ''}
                                if (stats.item3 != 0) {var i3 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item3+'.png" align="middle" width="20" height="20">';} else {i3 = ''}
                                if (stats.item4 != 0) {var i4 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item4+'.png" align="middle" width="20" height="20">';} else {i4 = ''}
                                if (stats.item5 != 0) {var i5 = '<img src="http://ddragon.leagueoflegends.com/cdn/'+staticDataVersion+'/img/item/'+stats.item5+'.png" align="middle" width="20" height="20">';} else {i5 = ''}
                            }


                            var matchType = data[j].queueType;
                            var fixedType = matchType.replace(/_/g," ");

                            var fixedFinal = fixedType.substring(0, fixedType.indexOf('x')-1) + fixedType.substring(fixedType.indexOf('x')+2);
                            fixedFinal = ''; //remove game type for now since all games are RANKED SOLO

                            field[j] = '<p style="font-size: 70%;border-radius:5px; filter: alpha+(Opacity=80);-moz-opacity:0.8; opacity:2; cellspacing:0px; line-height: 8px; padding: 5px; margin: 5px;height: 40; test-align: center; background-color: '+bgColor+'">' + htmlCode + '&nbsp;' + fixedFinal + '&nbsp;' + stats.kills + '/' + stats.deaths + '/' + stats.assists + '&nbsp;'+i0+i1+i2+i3+i4+i5+ '</p>';
                        }
                    }
                    if (j == data.length-1) {
                        extractStats(field , out);
                    }
                }
            },
            error: function(jqXHR, status, error){
                ShowFailure('Getting champion from db for stats failed');
            }
        });
    }

    function extractStats(field, output) {
        output.str = '';
        for (var i in field) {
            output.str = output.str+field[9-i];
        }
        var team = $(this ).attr('team');
        var player = $(this ).attr('player');
    }


    $('.span_playerName').mouseover(function(e) {

        var team = $(this ).attr('team');
        var player = $(this ).attr('player');

        if (stats_output[team][player].str == 'loading') {statsY0 = 0} else {statsY0 = Y_axis}
        var statsPage = "<div id='individualStats' width='5rem' height='3rem' style='position:absolute;border:solid #aaa 1px;background-color:#F9F9F9'>" + stats_output[team][player].str  + "</div>";

        $("body").append(statsPage);
        $("#individualStats").css({
            "top" :e.pageY + "px",
            "left" :e.pageX + "px"
        });
        $('#individualStats' ).css({
            "padding": 5+"px",
            "filter":"alpha"+(Opacity=80),
            "-moz-opacity":0.5,
            "opacity": 0.8
        });
    }).mousemove(function(e) {
        $('#individualStats').css({
            "top" :(e.pageY+statsY) + "px",
            "left" :(e.pageX+statsX) + "px"
        });
    }).mouseout(function() {
        $("#individualStats").remove();
    });




    //------------------------------------------------------ Runes ----------------------------------------------------------------------


    function extractRunes(playerObj, playerRuneStorage) {
        for (var i in playerCache) {
            var player = playerCache[i];
            var span = player.runes;
            $(span ).attr('team', player.team);
            $(span ).attr('player', player.player);
        }
        var runesObj = playerObj.runes;
        $.getJSON('../resources/'+localDataVersion+'/data/en_US/rune.json', function(result){
            var runesList = result.data;
            for (var i in runesObj) {
                for (var j in runesList) {
                    if (Number(runesObj[i].runeId) == Number(j)) {
                        var count = runesObj[i].count;
                        var outputStr = analysisRunes(count, runesList[j]);
                        playerRuneStorage.push(outputStr+"<br>");
                    }
                }
            }
            integrateRunes(playerRuneStorage);
        });
    }


    function extractRunes_fromdb(playerObj, playerRuneStorage) {
        for (var i in playerCache) {
            var player = playerCache[i];
            var span = player.runes;
            $(span ).attr('team', player.team);
            $(span ).attr('player', player.player);
        }
        var runesObj = playerObj.runes;
        var r_count=0;
        for (var m in runesObj) {
            $.ajax({
                type: 'GET',
                url: urlPrefix + '/db/rune' ,
                data: {runeId: runesObj[m].runeId},
                success: function(result) {
                    r_count++;
                    var count = runesObj[m].count;
                    var outputStr = analysisRunes(count, result);
                    playerRuneStorage.push(outputStr+"<br>");
                    if (r_count == runesObj.length) {
                        integrateRunes(playerRuneStorage);
                    }
                },
                error: function(jqXHR, status, error){
                    ShowFailure('Getting rune from db failed');
                }
            });
        }
    }

    function analysisRunes(count, runeObj) {
        var runeTotalValue = 0;
        var description = runeObj.description;
        for (var i in runeObj.stats) {
            runeTotalValue = Number(runeObj.stats[i]) * count;
        }
        if (description.indexOf('%') != -1) {
            var percentage = true;
            runeTotalValue = runeTotalValue * 100;
        }
        var prefix = '+';
        if (description.indexOf('-') != -1) {prefix = '-'}
        runeTotalValue = Number(runeTotalValue).toFixed(2);
        if (description.indexOf('regen') != -1) {runeTotalValue = (runeTotalValue * 4.5).toFixed(2); var regen = true;}
        if (description.indexOf('per level') == -1) {
            if (description.indexOf('Armor Penetration') != -1 && description.indexOf('Magic Penetration') != -1) {
                var midPoint = description.indexOf('/');
                var firstHalf = description.substring(0,midPoint);
                var secondHalf = description.substring(midPoint);
                var firstNumber = description.substring(0, description.indexOf(' Armor Penetration'));
                var secondNumber = description.substring(midPoint+2, description.indexOf(' Magic Penetration'));
                firstNumber = Number(firstNumber) * count;
                var firstPiece = prefix+firstNumber+description.substring(description.indexOf(' '), midPoint+2);
                secondNumber = Number(secondNumber) * count;
                secondNumber = secondNumber.toFixed(2);
                var secondPiece = secondNumber+' Magic Penetration';
                var output = firstPiece+secondPiece;
                return output;
            } else {
                var postfix = description.substr(description.indexOf(' '));
                if (runeTotalValue < 0) {
                    prefix = '';
                }
                if (percentage == true) {runeTotalValue = runeTotalValue + '%';}
                var output = prefix+runeTotalValue+' '+postfix;
                return output;
            }
        } else {
            var secondPoint = description.indexOf(' at champion level 18)');
            var firstPoint = description.indexOf(' ');
            var firstBracket = description.indexOf('(');
            var firstPiece = description.substring(firstPoint, firstBracket);
            var secondPiece = description.substr(secondPoint);
            var secondHalf = description.substr(firstPoint);
            var secondPlusSign = secondHalf.indexOf(prefix);

            if (runeTotalValue < 0) {
                prefix = '';
            }
            if (percentage == true) {
                runeTotalValue = runeTotalValue + '%';
                var valueAt18 = (Number(description.substring(firstBracket+1, secondPoint-1)) * count).toFixed(2);
                if (regen == true) {valueAt18 = (valueAt18 * 0.9).toFixed(2)}
                var outputScale = prefix+runeTotalValue+' '+firstPiece+'('+valueAt18+'%'+secondPiece;
            } else {
                var valueAt18 = (Number(description.substring(firstBracket+1, secondPoint)) * count).toFixed(2);
                if (regen == true) {valueAt18 = (valueAt18 * 0.9).toFixed(2)}
                var outputScale = prefix+runeTotalValue+' '+firstPiece+'('+valueAt18+secondPiece;
            }
            return outputScale;
        }
    }

    function fixRuneOutput(runeArray) {
        var output = '';
        for (var i in runeArray) {
            var str = runeArray[i].toString();
            output = output + str;
        }
        return output;
    }

    function integrateRunes(runeArray) {
        console.log(runeArray);
        for (var i in runeArray) {
            for (var j in runeArray) {
                if (i != j) {
                    //console.log('rune['+i+']= '+runeArray[i])
                    //console.log('rune['+j+']= '+runeArray[j])
                    var point1 = runeArray[i].indexOf(' ');
                    var point2 = runeArray[j].indexOf(' ');
                    var one = runeArray[i].substr(point1);
                    var two = runeArray[j].substr(point2)
                    if (one == two) {
                        var val1 = runeArray[i].substring(0, point1);
                        var val2 = runeArray[j].substring(0, point2);
                        if (val1.indexOf('%') != -1 && val2.indexOf('%') != -1) {
                            var percentage = true;
                            val1 = val1.substring(0, val1.length-2);
                            val2 = val2.substring(0, val2.length-2);
                        }
                        if (val1.indexOf('+') != -1) {
                            var plus = true;
                        } else {
                            var plus = false;
                        }

                        if (j>i) {
                            var newVal = Number(val1)+Number(val2);
                            newVal = newVal.toFixed(2);
                            if (percentage == true) {
                                newVal = newVal+'%';
                            }
                            if (plus == true) {
                                var newStr = '+'+newVal+one;
                            } else {
                                var newStr = '-'+newVal+one;
                            }
                            runeArray[i] = newStr;
                            runeArray.splice(j , 1);
                        }
                        else {
                            var newVal = Number(val1)+Number(val2);
                            newVal = newVal.toFixed(2);
                            if (percentage == true) {
                                newVal = newVal+'%';
                            }
                            if (plus == true) {
                                var newStr = '+'+newVal+one;
                            } else {
                                var newStr = '-'+newVal+one;
                            }
                            runeArray[j] = newStr;
                            runeArray.splice(i , 1);
                        }

                    }
                }
            }
        }
        for (var i in runeArray) {
            for (var j in runeArray) {
                if (i != j && runeArray[i].indexOf('Armor') != -1 && runeArray[i].indexOf('Magic') != -1 && runeArray[j].indexOf('Armor') != -1 && runeArray[j].indexOf('Magic') != -1) {
                    if (i<j) {var S = i; var L = j;}
                    else {var S = j; var L = i;}
                    var P1 = runeArray[S].substring(0, runeArray[S].indexOf('/')+2);
                    var P2 = runeArray[S].substring(runeArray[S].indexOf('/')+2);
                    var N1 = P1.substring(0, P1.indexOf(' '));
                    var N2 = P2.substring(0, P2.indexOf(' '));
                    var P3 = runeArray[L].substring(0, runeArray[L].indexOf('/')+2);
                    var P4 = runeArray[L].substring(runeArray[L].indexOf('/')+2);
                    var N3 = P3.substring(0, P3.indexOf(' '));
                    var N4 = P4.substring(0, P4.indexOf(' '));
                    var V1 = (Number(N1)+Number(N3)).toFixed(2);
                    var V2 = (Number(N2)+Number(N4)).toFixed(2);
                    var P1_withoutNumber = P1.substring(P1.indexOf(' '), P1.indexOf('/')+2);
                    var P2_withoutNumber = P2.substring(P2.indexOf(' '));
                    var case1output = '+'+V1+P1_withoutNumber+V2+P2_withoutNumber;
                    if (j>i) {
                        runeArray[i] = case1output;
                        runeArray.splice(j , 1);
                    } else {
                        runeArray[j] = case1output;
                        runeArray.splice(i , 1);
                    }
                }
            }
        }
        for (var i in runeArray) {
            for (var j in runeArray) {
                    if (i != j && runeArray[i].indexOf('level 18') != -1 && runeArray[i].substring(runeArray[i].indexOf(' '), runeArray[i].indexOf( 'per level' ) ) == runeArray[j].substring(runeArray[j].indexOf(' ') , runeArray[j].indexOf( 'per level' ) ) ) {
                        var val1 = runeArray[i].substring(0, runeArray[i].indexOf(' '));
                        var val2 = runeArray[j].substring(0, runeArray[j].indexOf(' '));
                        var val3 = runeArray[i].substring(runeArray[i].indexOf('(')+1,runeArray[i].indexOf(' at champion level 18'));
                        var val4 = runeArray[j].substring(runeArray[j].indexOf('(')+1,runeArray[j].indexOf(' at champion level 18'));
                        var newVal1 = Number(val1)+Number(val2);
                        var newVal2 = Number(val3)+Number(val4);
                        newVal1 = newVal1.toFixed(2);
                        newVal2 = newVal2.toFixed(2);
                        var midPiece = runeArray[i].substring(runeArray[i].indexOf(' '), runeArray[i].indexOf('(')+1);
                        var newStr = '+'+newVal1+midPiece+newVal2+' at champion level 18)<br>';
                        if (j>i) {
                            runeArray[i] = newStr;
                            runeArray.splice(j , 1);
                        } else {
                            runeArray[j] = newStr;
                            runeArray.splice(i , 1);
                        }
                    }

            }
        }
    }


    $('.td_runes').mouseover(function(e) {
        var team = $(this ).find('span' ).attr('team');
        var player = $(this ).find('span' ).attr('player');

        var toolTip = "<div id='runesInfo' width='5rem' height='3rem' style='position:absolute;border:solid #aaa 1px;background-color:#F9F9F9'>" + fixRuneOutput(runesCache[team][player])  + "</div>";

        $("body").append(toolTip);
        $("#runesInfo").css({
            "top" :e.pageY + "px",
            "left" :e.pageX + "px"
        });
        $('#runesInfo' ).css({
            "padding": 5+"px",
            "filter":"alpha"+(Opacity=80),
            "-moz-opacity":0.5,
            "opacity": 0.8
        });
    }).mousemove(function(e) {
        $('#runesInfo').css({
            "top" :(e.pageY-30) + "px",
            "left" :(e.pageX+10) + "px"
        });
    }).mouseout(function() {
        $("#runesInfo").remove();
    });


    //------------------------------------------------------- fill out table -----------------------------------------------------

    function getTheRestData(team1, team2){
        $( grid_team1_player1.name ).html( team1[0].summonerName );
        //getMMR( {summonerName : team1[0].summonerName} , grid_team1_player1 );
        getChampionFromDB( {championId : team1[0].championId} , grid_team1_player1 );
        drawSpellIcon(team1[0].spell1Id ,team1[0].spell2Id,  grid_team1_player1 );
        getMastery(team1[0].masteries, grid_team1_player1);
        getRank( {summonerId : team1[0].summonerId} , grid_team1_player1 , 'team1');
        getRankStats({summonerId : team1[0].summonerId}, team1[0].championId, grid_team1_player1);
        getMatchHistory({summonerId: team1[0].summonerId}, grid_team1_player1, t1_p1_stats, stats_output[1][1]);
        extractRunes(team1[0], runesCache[1][1]);

        $( grid_team1_player2.name ).html( team1[1].summonerName );
        //getMMR( {summonerName : team1[1].summonerName} , grid_team1_player2 );
        getChampionFromDB( {championId : team1[1].championId} , grid_team1_player2 );
        drawSpellIcon(team1[1].spell1Id ,team1[1].spell2Id,  grid_team1_player2 );
        getMastery(team1[1].masteries, grid_team1_player2);
        getRank( {summonerId : team1[1].summonerId} , grid_team1_player2 , 'team1');
        getRankStats({summonerId : team1[1].summonerId}, team1[1].championId, grid_team1_player2);
        getMatchHistory({summonerId: team1[1].summonerId}, grid_team1_player2, t1_p2_stats, stats_output[1][2]);
        extractRunes(team1[1], runesCache[1][2]);

        $( grid_team1_player3.name ).html( team1[2].summonerName );
        //getMMR( {summonerName : team1[2].summonerName} , grid_team1_player3 );
        getChampionFromDB( {championId : team1[2].championId} , grid_team1_player3 );
        drawSpellIcon(team1[2].spell1Id ,team1[2].spell2Id,  grid_team1_player3 );
        getMastery(team1[2].masteries, grid_team1_player3);
        getRank( {summonerId : team1[2].summonerId} , grid_team1_player3 , 'team1');
        getRankStats({summonerId : team1[2].summonerId}, team1[2].championId, grid_team1_player3);
        getMatchHistory({summonerId: team1[2].summonerId}, grid_team1_player3, t1_p3_stats, stats_output[1][3]);
        extractRunes(team1[2], runesCache[1][3]);

        $( grid_team1_player4.name ).html( team1[3].summonerName );
        //getMMR( {summonerName : team1[3].summonerName} , grid_team1_player4 );
        getChampionFromDB( {championId : team1[3].championId} , grid_team1_player4 );
        drawSpellIcon(team1[3].spell1Id ,team1[3].spell2Id,  grid_team1_player4 );
        getMastery(team1[3].masteries, grid_team1_player4);
        getRank( {summonerId : team1[3].summonerId} , grid_team1_player4 , 'team1');
        getRankStats({summonerId : team1[3].summonerId}, team1[3].championId, grid_team1_player4);
        getMatchHistory({summonerId: team1[3].summonerId}, grid_team1_player4, t1_p4_stats, stats_output[1][4]);
        extractRunes(team1[3], runesCache[1][4]);

        $( grid_team1_player5.name ).html( team1[4].summonerName );
        //getMMR( {summonerName : team1[4].summonerName} , grid_team1_player5 );
        getChampionFromDB( {championId : team1[4].championId} , grid_team1_player5 );
        drawSpellIcon(team1[4].spell1Id ,team1[4].spell2Id,  grid_team1_player5 );
        getMastery(team1[4].masteries, grid_team1_player5);
        getRank( {summonerId : team1[4].summonerId} , grid_team1_player5 , 'team1');
        getRankStats({summonerId : team1[4].summonerId}, team1[4].championId, grid_team1_player5);
        getMatchHistory({summonerId: team1[4].summonerId}, grid_team1_player5, t1_p5_stats, stats_output[1][5]);
        extractRunes(team1[4], runesCache[1][5]);



        $( grid_team2_player1.name ).html( team2[0].summonerName );
        //getMMR( {summonerName : team2[0].summonerName} , grid_team2_player1 );
        getChampionFromDB( {championId : team2[0].championId} , grid_team2_player1 );
        drawSpellIcon(team2[0].spell1Id ,team2[0].spell2Id,  grid_team2_player1 );
        getMastery(team2[0].masteries, grid_team2_player1);
        getRank( {summonerId : team2[0].summonerId} , grid_team2_player1 , 'team2');
        getRankStats({summonerId : team2[0].summonerId}, team2[0].championId, grid_team2_player1);
        getMatchHistory({summonerId: team2[0].summonerId}, grid_team2_player1, t2_p1_stats, stats_output[2][1]);
        extractRunes(team2[0], runesCache[2][1]);

        $( grid_team2_player2.name ).html( team2[1].summonerName );
        //getMMR( {summonerName : team2[1].summonerName} , grid_team2_player2 );
        getChampionFromDB( {championId : team2[1].championId} , grid_team2_player2 );
        drawSpellIcon(team2[1].spell1Id ,team2[1].spell2Id,  grid_team2_player2 );
        getMastery(team2[1].masteries, grid_team2_player2);
        getRank( {summonerId : team2[1].summonerId} , grid_team2_player2 , 'team2');
        getRankStats({summonerId : team2[1].summonerId}, team2[1].championId, grid_team2_player2);
        getMatchHistory({summonerId: team2[1].summonerId}, grid_team2_player2, t2_p2_stats, stats_output[2][2]);
        extractRunes(team2[1], runesCache[2][2]);

        $( grid_team2_player3.name ).html( team2[2].summonerName );
        //getMMR( {summonerName : team2[2].summonerName} , grid_team2_player3 );
        getChampionFromDB( {championId : team2[2].championId} , grid_team2_player3 );
        drawSpellIcon(team2[2].spell1Id ,team2[2].spell2Id,  grid_team2_player3 );
        getMastery(team2[2].masteries, grid_team2_player3);
        getRank( {summonerId : team2[2].summonerId} , grid_team2_player3 , 'team2');
        getRankStats({summonerId : team2[2].summonerId}, team2[2].championId, grid_team2_player3);
        getMatchHistory({summonerId: team2[2].summonerId}, grid_team2_player3, t2_p3_stats, stats_output[2][3]);
        extractRunes(team2[2], runesCache[2][3]);

        $( grid_team2_player4.name ).html( team2[3].summonerName );
        //getMMR( {summonerName : team2[3].summonerName} , grid_team2_player4 );
        getChampionFromDB( {championId : team2[3].championId} , grid_team2_player4 );
        drawSpellIcon(team2[3].spell1Id ,team2[3].spell2Id,  grid_team2_player4 );
        getMastery(team2[3].masteries, grid_team2_player4);
        getRank( {summonerId : team2[3].summonerId} , grid_team2_player4 , 'team2');
        getRankStats({summonerId : team2[3].summonerId}, team2[3].championId, grid_team2_player4);
        getMatchHistory({summonerId: team2[3].summonerId}, grid_team2_player4, t2_p4_stats, stats_output[2][4]);
        extractRunes(team2[3], runesCache[2][4]);

        $( grid_team2_player5.name ).html( team2[4].summonerName );
        //getMMR( {summonerName : team2[4].summonerName} , grid_team2_player5 );
        getChampionFromDB( {championId : team2[4].championId} , grid_team2_player5 );
        drawSpellIcon(team2[4].spell1Id ,team2[4].spell2Id,  grid_team2_player5 );
        getMastery(team2[4].masteries, grid_team2_player5);
        getRank( {summonerId : team2[4].summonerId} , grid_team2_player5 , 'team2');
        getRankStats({summonerId : team2[4].summonerId}, team2[4].championId, grid_team2_player5);
        getMatchHistory({summonerId: team2[4].summonerId}, grid_team2_player5, t2_p5_stats, stats_output[2][5]);
        extractRunes(team2[4], runesCache[2][5]);
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
    next(team1, team2);
}

