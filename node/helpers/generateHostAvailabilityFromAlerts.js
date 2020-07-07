const moment = require('moment');

const callServer = require('./callServer');
const { filterLogs, filterLogsByDate } = require('./filterLogs');
const getHostLogsCommand = require('./getHostLogsCommand');
const getHostStatesCommand = require('./getHostStatesCommand');

const generateTimelineOutsideNotifications = require('./generateTimelineOutsideNotifications');
const generateTimelineFromStates = require('./generateTimelineFromStates');
const finalizeAvailability = require('./finalizeAvailability');

const {
  displayFormat,
  hostStateTypes,
  hostFilterTypes,
  hostFlappingType,
  hostFlappingStateTypeStarted,
  hostFlappingStateTypeStopped,
  dateFormat,
} = require('./setting');

const getState = (pluginOutput) => {
  let state = pluginOutput.split(' ')[0];
  switch (state) {
    case 'OK':
      state = 'UP';
      break;
    case 'CRITICAL':
      state = 'DOWN';
      break;
  }

  return state;
};

const updatePluginOutput = (pluginOutput, state, from, until, stateLogs) => {
  let result = pluginOutput;
  const differentDate = until.format(dateFormat) !== from.format(dateFormat);

  if (state === 'UP' && differentDate) {
    const filteredStateLogs = stateLogs.filter((item) => {
      const from = moment.unix(item[0]);
      return from.format(dateFormat) === until.format(dateFormat);
    });

    if (filteredStateLogs.length === 1) {
      result = filteredStateLogs[0][2];
    }
  }

  return result;
};

const generateTimeline = (
  rangeDuration,
  rangeUntil,
  hostLogs,
  stateLogs,
  availabilty,
  timelines
) => {
  let isFlapping;
  let until = rangeUntil;
  let timeline = [];

  // filter logs
  const filteredHostLogs = hostLogs.filter((item) =>
    hostFilterTypes.includes(item[1])
  );

  for (let index = 0; index < filteredHostLogs.length; index++) {
    let item = filteredHostLogs[index];
    let addTimeline = false;

    const from = moment.unix(item[0]);
    const duration = (from.diff(until) / rangeDuration) * 100;
    const type = item[1];
    const stateType = item[2];

    let pluginOutput = item[3];
    let state = getState(pluginOutput, stateLogs);
    pluginOutput = updatePluginOutput(
      pluginOutput,
      state,
      from,
      until,
      stateLogs
    );

    if (
      type === hostFlappingType &&
      stateType === hostFlappingStateTypeStopped
    ) {
      isFlapping = true;

      // add timeline after flapping
      addTimeline = true;
      state = getState(filteredHostLogs[index + 1][3], stateLogs);
      pluginOutput = '';
    }

    if (isFlapping && stateType === hostFlappingStateTypeStarted) {
      isFlapping = false;
      state = 'Flapping';
      pluginOutput = '';
    }

    if (!isFlapping || addTimeline) {
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

      // update data
      availabilty[state] += duration;
      timelines[state].push(result);
      timeline.push(result);

      // update until
      until = from;
    }
  }

  return timeline;
};

const generateHostAvailabilityFromAlerts = async (
  hostName,
  rangeFrom,
  rangeUntil
) => {
  // get notification logs
  let command = getHostLogsCommand(hostName);
  let hostLogs = await callServer(command);
  hostLogs = filterLogs(hostLogs, rangeFrom, rangeUntil);

  // get state
  command = getHostStatesCommand(hostName);
  let stateLogs = await callServer(command);
  stateLogs = filterLogsByDate(stateLogs, rangeFrom, rangeUntil);

  // init result
  let availabilty = {};
  const timelines = {};
  for (const state of hostStateTypes) {
    availabilty[state] = 0;
    timelines[state] = [];
  }
  const rangeDuration = rangeFrom.diff(rangeUntil);

  // generate timeline
  timeline = generateTimeline(
    rangeDuration,
    rangeUntil,
    hostLogs,
    stateLogs,
    availabilty,
    timelines
  );

  // add timeline from rangeFrom
  const lastTimeline = timeline[timeline.length - 1];
  if (lastTimeline && lastTimeline.from > rangeFrom.format(displayFormat)) {
    generateTimelineOutsideNotifications(
      hostStateTypes,
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

module.exports = generateHostAvailabilityFromAlerts;
