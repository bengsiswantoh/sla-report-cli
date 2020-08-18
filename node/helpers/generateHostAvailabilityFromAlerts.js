const moment = require('moment');

const callServer = require('./callServer');
const { filterLogs, filterLogsByDate } = require('./filterLogs');
const getHostLogsCommand = require('./getHostLogsCommand');
const getHostStatesCommand = require('./getHostStatesCommand');

const generateTimelineOutsideLogs = require('./generateTimelineOutsideLogs');
const generateTimelineFromStates = require('./generateTimelineFromStates');
const finalizeAvailability = require('./finalizeAvailability');

const {
  displayFormat,
  dateFormat,
  hostStateTypes,
  hostFilterTypes,
  hostFlappingType,
  hostDowntimeType,
  stateTypeStarted,
  stateTypeStopped,
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
    case 'WARNING':
      state = 'UP';
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
  filterTypes,
  logs,
  stateLogs,
  availabilty,
  timelines
) => {
  let ignoreLine;
  let until = rangeUntil;
  const timeline = [];

  // filter logs
  const filteredLogs = logs.filter((item) => filterTypes.includes(item[1]));

  for (let index = 0; index < filteredLogs.length; index++) {
    const item = filteredLogs[index];
    let addTimeline = false;

    const from = moment.unix(item[0]);
    const duration = (from.diff(until) / rangeDuration) * 100;

    const type = item[1];
    const stateType = item[2];

    let pluginOutput = item[3];
    let state = getState(pluginOutput);
    pluginOutput = updatePluginOutput(
      pluginOutput,
      state,
      from,
      until,
      stateLogs
    );

    // Found flapping or downtime stopped
    if (
      stateType === stateTypeStopped &&
      (type === hostFlappingType || type === hostDowntimeType)
    ) {
      ignoreLine = true;

      // add timeline after flapping
      addTimeline = true;
      let nextIndex = index + 1;
      if (
        filteredLogs[nextIndex][1] === hostFlappingType ||
        filteredLogs[nextIndex][1] === hostDowntimeType
      ) {
        nextIndex += 1;
      }
      pluginOutput = filteredLogs[nextIndex][3];
      state = getState(pluginOutput);
      pluginOutput = '';
    }

    // Found started log
    if (ignoreLine && stateType === stateTypeStarted) {
      ignoreLine = false;
      if (type === hostFlappingType) {
        state = 'Flapping';
      }
      if (type === hostDowntimeType) {
        state = 'Downtime';
      }
      pluginOutput = '';
    }

    if (!ignoreLine || addTimeline) {
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
  rangeUntil,
  filterTypes = hostFilterTypes
) => {
  // get logs
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
  const timeline = generateTimeline(
    rangeDuration,
    rangeUntil,
    filterTypes,
    hostLogs,
    stateLogs,
    availabilty,
    timelines
  );

  // add timeline from rangeFrom
  const lastTimeline = timeline[timeline.length - 1];
  if (lastTimeline && lastTimeline.from > rangeFrom.format(displayFormat)) {
    generateTimelineOutsideLogs(
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

  // generate timeline with no logs
  if (timeline.length === 0) {
    generateTimelineFromStates(
      hostStateTypes,
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
