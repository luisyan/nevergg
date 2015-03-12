var mmr = require('../');

mmr('Turtle the Cat', function(error, response) {
  if (error) {
    throw error;
  }

  console.log(response);
  // => {
  // =>   log: '',
  // =>   tip: {
  // =>     status: '',
  // =>     leagueAverage: '',
  // =>     notice: ''
  // =>   },
  // =>   mmr: '2,669',
  // =>   class: ''
  // => }
});