/**
 * Created by admin on 15-03-04.
 */

var express = require('express');
var app = express();
var logger = require('./logger');

app.get('/', function (req, res) {
    res.send('Hello World!')
})



var server = app.listen(28000);
console.log('Server is listening at', 28000)

server.timeout = 300000;
