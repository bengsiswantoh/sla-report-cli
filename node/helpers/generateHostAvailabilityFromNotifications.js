const moment = require('moment');

const callServer = require('./callServer');
const { filterLogs, filterLogsByDate } = require('./filterLogs');
const getHostNotificationsCommand = require('./getHostNotificationsCommand');
const getHostStatesCommand = require('./getHostStatesCommand');

const checkState = require('./checkState');
const generateTimelineOutsideNotifications = require('./generateTimelineOutsideNotifications');
const generateTimelineFromStates = require('./generateTimelineFromStates');
const finalizeAvailability = require('./finalizeAvailability');

const { displayFormat, hostStateType } = require('./setting');

const generateTimeline = (
  rangeDuration,
  rangeUntil,
  notificationLogs,
  availabilty,
  timelines
) => {
  let until = rangeUntil;

  timeline = notificationLogs.map((item) => {
    const from = moment.unix(item[0]);
    const duration = (from.diff(until) / rangeDuration) * 100;
    const { state, pluginOutput } = checkState(item[1], item[2]);

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

  return timeline;
};

const generateHostAvailabilityFromAlerts = async (
  hostName,
  rangeFrom,
  rangeUntil
) => {
  // get notification logs
  let command = getHostNotificationsCommand(hostName);
  let notificationLogs = await callServer(command);
  notificationLogs = filterLogs(notificationLogs, rangeFrom, rangeUntil);

  // get state
  command = getHostStatesCommand(hostName);
  let stateLogs = await callServer(command);
  stateLogs = filterLogsByDate(stateLogs, rangeFrom, rangeUntil);

  // init result
  let availabilty = {};
  const timelines = {};
  for (const state of hostStateType) {
    availabilty[state] = 0;
    timelines[state] = [];
  }
  const rangeDuration = rangeFrom.diff(rangeUntil);

  timeline = generateTimeline(
    rangeDuration,
    rangeUntil,
    notificationLogs,
    availabilty,
    timelines
  );

  // add timeline from rangeFrom
  const lastTimeline = timeline[timeline.length - 1];
  if (lastTimeline && lastTimeline.from > rangeFrom.format(displayFormat)) {
    generateTimelineOutsideNotifications(
      hostStateType,
      stateLogs,
      lastTimeline,
      rangeFrom,
      rangeDuration,
      availabilty,
      timelines,
      timeline
    );
  }

  // generate timeline no notification
  if (timeline.length === 0) {
    generateTimelineFromStates(
      stateTypes,
      stateLogs,
      rangeFrom,
      rangeUntil,
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

module.exports = generateHostAvailabilityFromAlerts;
