const moment = require('moment');
require('dotenv').config();

const displayFormat = process.env.DISPLAY_FORMAT;
const dateFormat = process.env.DATE_FORMAT;
const NAState = process.env.NAState;

const generateTimelineFromStates = (
  stateTypes,
  stateLogs,
  rangeFrom,
  rangeUntil,
  rangeDuration,
  availabilty,
  timelines,
  timeline
) => {
  const firstStateLog = stateLogs[0];
  const firstStateLogFrom = moment.unix(firstStateLog[0]);

  const lastStateLog = stateLogs[stateLogs.length - 1];
  const lastStateLogFrom = moment.unix(lastStateLog[0]);

  // TODO: need example if host down
  let from = rangeFrom;
  let until = rangeUntil;
  let duration = (from.diff(until) / rangeDuration) * 100;
  let state = NAState;
  let pluginOutput = firstStateLog[2];
  let result;
  if (firstStateLogFrom.format(dateFormat) === rangeUntil.format(dateFormat)) {
    // add up
    from = lastStateLogFrom;
    duration = (from.diff(until) / rangeDuration) * 100;
    state = stateTypes[0];

    result = {
      fromMoment: from,
      from: from.format(displayFormat),
      untilMoment: until,
      until: until.format(displayFormat),
      durationFloat: duration,
      duration: `${duration.toFixed(2)}%`,
      state,
      pluginOutput,
    };

    availabilty[state] += duration;
    timelines[state].push(result);
    timeline.push(result);

    // add N/A
    until = from;
    from = rangeFrom;
    duration = (from.diff(until) / rangeDuration) * 100;
    result = {
      fromMoment: from,
      from: from.format(displayFormat),
      untilMoment: until,
      until: until.format(displayFormat),
      durationFloat: duration,
      duration: `${duration.toFixed(2)}%`,
      state: NAState,
      pluginOutput: '',
    };
  } else {
    state = NAState;

    result = {
      fromMoment: from,
      from: from.format(displayFormat),
      untilMoment: until,
      until: until.format(displayFormat),
      durationFloat: duration,
      duration: `${duration.toFixed(2)}%`,
      state,
      pluginOutput,
    };
  }

  availabilty[result.state] += duration;
  timelines[result.state].push(result);
  timeline.push(result);
};

module.exports = generateTimelineFromStates;
