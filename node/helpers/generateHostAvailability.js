require('dotenv').config();
const moment = require('moment');

const displayFormat = process.env.DISPLAY_FORMAT;

const generateHostAvailability = (logs, stateTypes, rangeFrom, rangeUntil) => {
  let until = rangeUntil;
  const rangeDuration = rangeFrom.diff(rangeUntil);

  const availabilty = {};
  const timelines = {};

  for (const state of stateTypes) {
    availabilty[state] = 0;
    timelines[state] = [];
  }

  timeline = logs.map((item) => {
    const from = moment.unix(item[0]);
    let state = item[1];

    let regexResult;
    const regexFlappingStart = /FLAPPINGSTART \((\w+)\)/;
    regexResult = state.match(regexFlappingStart);
    if (regexResult) {
      state = 'Flapping';
    }
    const regexFlappingStop = /FLAPPINGSTOP \((\w+)\)/;
    regexResult = state.match(regexFlappingStop);
    if (regexResult) {
      state = regexResult[1];
    }

    const pluginOutput = item[2];
    let duration = (from.diff(until) / rangeDuration) * 100;
    duration = duration;

    const result = {
      fromMoment: from,
      from: from.format(displayFormat),
      untilMoment: until,
      until: until.format(displayFormat),
      durationFloat: duration,
      duration: `${duration.toFixed(2)}%`,
      state,
      pluginOutput,
    };

    // update until
    until = from;

    // update data
    availabilty[state] += duration;
    timelines[state].push(result);

    return result;
  });

  timelines['summary'] = timeline;

  return { availabilty, timelines };
};

module.exports = generateHostAvailability;
