/**
 * Created by admin on 15-03-05.
 */
$(document).ready(function(){

    $('#btn_hello' ).click(function(){
        var url = 'http://localhost:22000';
        $.ajax({
            type: 'GET',
            url: url ,
            success: function(result) {
                $('#p_s_hello' ).html(JSON.stringify(result));
            },
            error: function(jqXHR, status, error){
                $('#p_s_hello' ).append('hello world failed, ret = ' + status + ', status = ' + jqXHR.status + '<br>');
            }
        });
    });
});
