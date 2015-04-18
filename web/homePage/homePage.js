/**
 * Created by admin on 15-04-18.
 */

$(document).ready(function() {
    $("#homePage-searchBox").keydown(function() {
        if (event.keyCode == "13") {
            var name = $('#homePage-searchBox' ).val();
            var url = 'main.html#'+name;
            window.location.replace(url);
            return false;
        }
    });
});


















