var hyperquest = require('hyperquest');
var JSONStream = require('JSONStream');
var querystring = require('querystring');

var HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'opgg-mmr'
};

function mmr(username, callback) {
  var stream = hyperquest.post('http://na.op.gg/summoner/ajax/mmr.json/', {headers: HEADERS});
  stream
    .pipe(JSONStream.parse())
    .on('root', function(obj) {
      callback(null, obj);
    })
    .on('error', function(error) {
      callback(error);
    });
  stream.end(querystring.stringify({userName: username}));
}

module.exports = mmr;