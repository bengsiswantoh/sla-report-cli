const moment = require('moment');
const checkState = require('./checkState');
const generateTimelineOutsideNotifications = require('./generateTimelineOutsideNotifications');
const finalizeAvailability = require('./finalizeAvailability');
require('dotenv').config();

const displayFormat = process.env.DISPLAY_FORMAT;

const addResultBottom = (
  hostDownTimeline,
  until,
  rangeDuration,
  state,
  pluginOutput,
  availabilty,
  timelines,
  timeline
) => {
  const fromBottom = hostDownTimeline.untilMoment;
  const durationBottom = (fromBottom.diff(until) / rangeDuration) * 100;

  // resultBottom
  let resultBottom = {
    fromMoment: fromBottom,
    from: fromBottom.format(displayFormat),
    untilMoment: until,
    until: until.format(displayFormat),
    durationFloat: durationBottom,
    duration: `${durationBottom.toFixed(2)}%`,
    state,
    pluginOutput,
  };
  availabilty[state] += parseFloat(durationBottom);
  timelines[state].push(resultBottom);
  timeline.push(resultBottom);
};

const addHostDown = (hostDownTimeline, availabilty, timelines, timeline) => {
  const hostDownState = 'H.Down';
  hostDownTimeline.state = hostDownState;

  availabilty[hostDownState] += hostDownTimeline.durationFloat;
  timelines[hostDownState].push(hostDownTimeline);
  timeline.push(hostDownTimeline);
};

const modifyResult = (result, hostDownTimeline, rangeDuration) => {
  result.untilMoment = hostDownTimeline.fromMoment;
  result.until = hostDownTimeline.from;

  const duration =
    (result.fromMoment.diff(result.untilMoment) / rangeDuration) * 100;
  result.durationFloat = duration;
  result.duration = `${duration.toFixed(2)}%`;

  return result;
};

const generateServiceAvailability = (
  notificationLogs,
  stateLogs,
  hostDownTimelines,
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

  const timeline = [];
  let hostDownTimeline;

  notificationLogs.map((item) => {
    const from = moment.unix(item[0]);
    let duration = (from.diff(until) / rangeDuration) * 100;
    let state = checkState(item[1]);
    const pluginOutput = item[2];

    let result = {
      fromMoment: from,
      from: from.format(displayFormat),
      untilMoment: until,
      until: until.format(displayFormat),
      durationFloat: duration,
      duration: `${duration.toFixed(2)}%`,
      state,
      pluginOutput,
    };

    // check host down timeline
    if (hostDownTimeline || hostDownTimelines.length > 0) {
      if (!hostDownTimeline) {
        hostDownTimeline = hostDownTimelines.shift();
      }

      while (
        hostDownTimeline &&
        from.format(displayFormat) < hostDownTimeline.from
      ) {
        if (until.format(displayFormat) > hostDownTimeline.until) {
          addResultBottom(
            hostDownTimeline,
            until,
            rangeDuration,
            state,
            pluginOutput,
            availabilty,
            timelines,
            timeline
          );
        }

        addHostDown(hostDownTimeline, availabilty, timelines, timeline);
        result = modifyResult(result, hostDownTimeline, rangeDuration);

        until = result.untilMoment;
        hostDownTimeline = hostDownTimelines.shift();
      }
    }

    // update until
    until = from;

    // update data
    availabilty[state] += result.durationFloat;
    timelines[state].push(result);
    timeline.push(result);

    return null;
  });

  // add timeline from rangeFrom
  const lastTimeline = timeline[timeline.length - 1];
  if (lastTimeline && lastTimeline.from > rangeFrom.format(displayFormat)) {
    generateTimelineOutsideNotifications(
      'service',
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

module.exports = generateServiceAvailability;
