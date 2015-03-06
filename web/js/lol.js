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
});
