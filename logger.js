/**
 * Created by admin on 15-03-04.
 */
/*jslint node: true */
'use strict';

module.exports = require('tracer').console({
    format     : '{{timestamp}} <{{title}}> [{{PID}}] {{message}} ({{file}}:{{line}})' ,
    dateformat : 'yyyy-mm-dd HH:MM:ss l',
    preprocess : function (data) {
        data.PID = process.pid;
    },
    transport : function(data) {
        //stdout
        console.log(data.output);

    }
});

