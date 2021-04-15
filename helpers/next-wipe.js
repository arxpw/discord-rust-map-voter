const moment = require('moment');

const wipeDayNumeral = 'wednesday'; // thursday
const timeBetweenWipes = [1, 'week'];
const wipeTime = { hour: 19, minute: 30 };
const wipeTimeBetweenVoting = { type: 'hours', amount: -3 };

let nextWipe = moment()
  .startOf('isoWeek')
  .isoWeekday(wipeDayNumeral)
  .add(timeBetweenWipes);

// if today is greater than a thursday
const thursday = moment().day(wipeDayNumeral);
if (moment().day() <= moment().day(wipeDayNumeral)) nextWipe = thursday;

nextWipe.set('hour', wipeTime.hour).set('minute', wipeTime.minute);
const votingEnds = moment(nextWipe).add(
  wipeTimeBetweenVoting.amount,
  wipeTimeBetweenVoting.type
);

module.exports = {
  nextWipe,
  votingEnds
}
