const moment = require('moment');
const { displayFormat, dateFormat, NAState } = require('./setting');

const addFromState = (
  stateLogs,
  rangeFrom,
  lastTimeline,
  state,
  rangeDuration,
  availabilty,
  timelines,
  timeline
) => {
  const firstState = stateLogs[0];
  const lastState = stateLogs[stateLogs.length - 1];
  const lastStateFrom = moment.unix(lastState[0]);

  const from = rangeFrom;
  let until = lastTimeline.fromMoment;
  let duration = (from.diff(until) / rangeDuration) * 100;
  let pluginOutput = firstState[2];

  let result;
  if (lastStateFrom.format(dateFormat) > rangeFrom.format(dateFormat)) {
    // add up
    duration = (lastStateFrom.diff(until) / rangeDuration) * 100;

    result = {
      fromMoment: lastStateFrom,
      from: lastStateFrom.format(displayFormat),
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
    until = lastStateFrom;
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
    // add up
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

  return result;
};

const generateTimelineOutsideNotifications = (
  stateTypes,
  stateLogs,
  lastTimeline,
  rangeFrom,
  rangeDuration,
  availabilty,
  timelines,
  timeline
) => {
  stateLogs = stateLogs.filter((item) => {
    const from = item[0];
    return from <= lastTimeline.fromMoment.unix();
  });

  let result;
  if (stateLogs.length > 0) {
    // TODO: need example if host down
    const state = stateTypes[0];

    result = addFromState(
      stateLogs,
      rangeFrom,
      lastTimeline,
      state,
      rangeDuration,
      availabilty,
      timelines,
      timeline
    );
  } else {
    const from = rangeFrom;
    const until = lastTimeline.fromMoment;
    const duration = (from.diff(until) / rangeDuration) * 100;
    const state = NAState;
    const pluginOutput = '';

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

  availabilty[result.state] += result.durationFloat;
  timelines[result.state].push(result);
  timeline.push(result);
};

module.exports = generateTimelineOutsideNotifications;
