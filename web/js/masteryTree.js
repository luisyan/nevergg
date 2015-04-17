/**
 * Created by admin on 15-04-17.
 */
$(document).ready(function() {


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

    $('#p_s_t1_p4_mastery' ).find('button').on('click',function(){
        console.log('yes yes yes');
    })

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
            if (masteryIdNumber > 4100 && masteryIdNumber < 4200) {offense = offense + Number(playerMasteryList[i].rank);}
            if (masteryIdNumber > 4200 && masteryIdNumber < 4300) {defense = defense + Number(playerMasteryList[i].rank);}
            if (masteryIdNumber > 4300) {util = util + Number(playerMasteryList[i].rank);}
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


});