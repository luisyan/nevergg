/**
 * Created by admin on 15-04-18.
 */

$(document).ready(function() {
    var storeEnable;
    var store = $.AMUI.store;
    if (store.enabled) {
        storeEnable = true;
    } else {
        storeEnable = false;
    }

    if (storeEnable == true) {
        var region_key = store.get('regionKey');
        if (region_key != undefined) {
            $('.region-select > div > label' ).each(function() {
                if ($(this ).find('input' ).attr('value') == region_key) {
                    $(this ).click();
                }
            })
        }
    }




    $("#homePage-searchBox").keydown(function() {
        if ($('#homePage-searchBox' ).val() != '') {
            var region = $('.region-select > div' ).find('.am-active' ).find('input' ).attr('value');
            store.set('regionKey', region)

            if (event.keyCode == "13") {
                var name = $('#homePage-searchBox' ).val();
                var url = 'main.html#'+name+'&region='+region;
                window.location.replace(url);
                return false;
            }
        }
    });
});


















