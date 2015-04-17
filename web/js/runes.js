/**
 * Created by admin on 15-04-17.
 */
$(document).ready(function() {

    var staticDataVersion = '5.7.2';
    var localDataVersion = '5.7.2';


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
        for (var i in runeArray) {
            for (var j in runeArray) {
                if (i != j) {
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



});