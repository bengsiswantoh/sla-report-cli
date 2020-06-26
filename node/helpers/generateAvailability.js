require('dotenv').config();
const moment = require('moment');

const displayFormat = process.env.DISPLAY_FORMAT;

const generateAvailability = (logs, stateTypes, rangeFrom, rangeUntil) => {
  let until = rangeUntil;
  const rangeDuration = rangeFrom.diff(rangeUntil);

  const availabilty = {};
  const timelines = {};

  for (const state of stateTypes) {
    availabilty[state] = 0;
    timelines[state] = [];
    console.log(state);
  }

  timeline = logs.map((item) => {
    const from = moment.unix(item[0]);
    let state = item[1];
    switch (state) {
      case 'FLAPPINGSTART (DOWN)':
        state = 'Flapping';
        break;
      case 'FLAPPINGSTART (UP)':
        state = 'Flapping';
        break;
      case 'FLAPPINGSTOP (UP)':
        state = 'UP';
        break;
    }
    const pluginOutput = item[2];
    let duration = (from.diff(until) / rangeDuration) * 100;
    duration = duration.toFixed(2);

    const result = {
      from: from.format(displayFormat),
      until: until.format(displayFormat),
      duration: `${duration}%`,
      state,
      pluginOutput,
    };
    console.log('state', state);

    // update until
    until = from;

    // update data
    availabilty[state] += parseFloat(duration);
    timelines[state].push(result);

    return result;
  });

  timelines['summary'] = timeline;

  return { availabilty, timelines };
};

module.exports = generateAvailability;
