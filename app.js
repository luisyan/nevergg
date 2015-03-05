/**
 * Created by admin on 15-03-04.
 */

var express = require('express');
var app = express();
var logger = require('./logger');

app.get('/', function (req, res) {
    res.send('Hello World!')
})



var server = app.listen(22000);
logger.trace('server listening to port 22000');
server.timeout = 300000;