/**
 * Created by admin on 15-04-17.
 */
$(document).ready(function() {

    var staticDataVersion = '5.7.2';
    var localDataVersion = '5.7.2';

    function getEachMatchInfo(data) {
        var stats = {
            championId : data.championId,
            winner : data.stats.winner,
            kill : data.stats.kills,
            death : data.stats.deaths,
            assist : data.stats.assZists
        }
        return stats;
    }

    function makeStatsData(data, field, out) {
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
        console.log(team+' '+player);
        console.log(stats_output[team][player]);

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



});