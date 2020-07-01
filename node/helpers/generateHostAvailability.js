const moment = require('moment');
const checkState = require('./checkState');
const generateLastTimeline = require('./generateLastTimeline');
const finalizeAvailability = require('./finalizeAvailability');
require('dotenv').config();

const displayFormat = process.env.DISPLAY_FORMAT;

const generateHostAvailability = (
  logs,
  stateLogs,
  stateTypes,
  rangeFrom,
  rangeUntil
) => {
  let until = rangeUntil;
  const rangeDuration = rangeFrom.diff(rangeUntil);

  let availabilty = {};
  const timelines = {};

  for (const state of stateTypes) {
    availabilty[state] = 0;
    timelines[state] = [];
  }

  timeline = logs.map((item) => {
    const from = moment.unix(item[0]);
    const state = checkState(item[1]);
    const pluginOutput = item[2];
    const duration = (from.diff(until) / rangeDuration) * 100;

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

  // add timeline from rangeFrom
  const lastTimeline = timeline[timeline.length - 1];
  if (lastTimeline.from > rangeFrom.format(displayFormat)) {
    generateLastTimeline(
      stateLogs,
      lastTimeline,
      rangeFrom,
      rangeDuration,
      availabilty,
      timelines,
      timeline
    );
  }

  timelines['summary'] = timeline;

  availabilty = finalizeAvailability(availabilty);

  return { availabilty, timelines };
};

module.exports = generateHostAvailability;