const moment = require('moment');

const generateHostTimeline = require('./generateHostTimeline');

const {
  getServiceLogsCommand,
  getServiceStatesCommand,
} = require('./checkmkHelper/liveStatusCommand');
const callServer = require('./checkmkHelper/callServer');
const { filterLogs, filterLogsByDate } = require('./checkmkHelper/filterLogs');

const generateTimelineOutsideLogs = require('./checkmkHelper/generateTimelineOutsideLogs');
const generateTimelineFromStates = require('./checkmkHelper/generateTimelineFromStates');
const finalizeAvailability = require('./checkmkHelper/finalizeAvailability');

const {
  displayFormat,
  dateFormat,
  serviceStateTypes,
  serviceFilterTypes,
  serviceFlappingType,
  stateTypeStarted,
  stateTypeStopped,
} = require('./checkmkHelper/setting');

const addHostDown = (
  timeline,
  timelines,
  availabilty,
  hostDownTimes,
  rangeDuration
) => {
  // reset availability and timelines
  let hostDownTime;
  const timelineWithHost = [];
  for (const state of serviceStateTypes) {
    availabilty[state] = 0;
    timelines[state] = [];
  }

  let until = timeline[0].untilMoment;
  for (let index = 0; index < timeline.length; index++) {
    let result = timeline[index];
    const { state, pluginOutput } = result;

    let from = result.fromMoment;
    let duration = (from.diff(until) / rangeDuration) * 100;

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

    if (hostDownTime || hostDownTimes.length > 0) {
      if (!hostDownTime) {
        hostDownTime = hostDownTimes.shift();
      }

      while (hostDownTime && hostDownTime.untilMoment > from) {
        const resultBefore = { ...result };
        result.fromMoment = hostDownTime.untilMoment;
        result.from = hostDownTime.until;
        result.durationFloat =
          (result.fromMoment.diff(result.untilMoment) / rangeDuration) * 100;
        result.duration = `${result.durationFloat.toFixed(2)}%`;
        addResult(result, availabilty, timelines, timelineWithHost);

        result = { ...hostDownTime, state: 'H.Down' };

        if (from > result.fromMoment) {
          from = result.fromMoment;
        } else {
          addResult(result, availabilty, timelines, timelineWithHost);

          until = result.fromMoment;
          duration = (from.diff(until) / rangeDuration) * 100;
          result = {
            ...resultBefore,
            fromMoment: from,
            from: from.format(displayFormat),
            untilMoment: until,
            until: until.format(displayFormat),
            durationFloat: duration,
            duration: `${duration.toFixed(2)}%`,
          };
        }

        hostDownTime = hostDownTimes.shift();
      }
    }

    if (from <= until) {
      addResult(result, availabilty, timelines, timelineWithHost);

      // update until
      until = from;
    }
  }

  return timelineWithHost;
};

const addResult = (result, availabilty, timelines, timeline) => {
  availabilty[result.state] += result.durationFloat;
  const prevTimeline = timeline[timeline.length - 1];
  const stateTimeline = timelines[result.state];

  if (timeline.length > 0 && prevTimeline.state === result.state) {
    prevTimeline.fromMoment = result.fromMoment;
    prevTimeline.from = result.from;
    prevTimeline.durationFloat += result.durationFloat;
    prevTimeline.duration = `${prevTimeline.durationFloat.toFixed(2)}%`;

    stateTimeline[stateTimeline.length - 1] = prevTimeline;
  } else {
    stateTimeline.push(result);
    timeline.push(result);
  }
};

const getState = (pluginOutput) => {
  let state = pluginOutput.split(' ')[0];
  let regexResult;

  const regexWarn = /WARN\w*/;
  regexResult = state.match(regexWarn);
  if (regexResult) {
    state = serviceStateTypes[1];
  }

  const regexCrit = /CRIT\w*/;
  regexResult = state.match(regexCrit);
  if (regexResult) {
    state = serviceStateTypes[2];
  }

  const regexUnknown = /UNKOWN\w*/;
  regexResult = state.match(regexUnknown);
  if (regexResult) {
    state = serviceStateTypes[3];
  }

  return state;
};

const updatePluginOutput = (pluginOutput, state, from, until, stateLogs) => {
  let result = pluginOutput;
  const differentDate = until.format(dateFormat) !== from.format(dateFormat);

  if (state === 'OK' && differentDate) {
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
  logs,
  stateLogs,
  availabilty,
  timelines
) => {
  let hostDownTime;
  let ignoreLine;
  let until = rangeUntil;
  const timeline = [];

  // filter logs
  const filteredLogs = logs.filter((item) =>
    serviceFilterTypes.includes(item[1])
  );

  for (let index = 0; index < filteredLogs.length; index++) {
    const item = filteredLogs[index];
    let addTimeline = false;

    let from = moment.unix(item[0]);
    let duration = (from.diff(until) / rangeDuration) * 100;

    const type = item[1];
    const stateType = item[2];

    let pluginOutput = item[3];
    let state = getState(pluginOutput);
    // pluginOutput = updatePluginOutput(
    //   pluginOutput,
    //   state,
    //   from,
    //   until,
    //   stateLogs
    // );

    // Found flapping or downtime stopped
    if (stateType === stateTypeStopped && type === serviceFlappingType) {
      ignoreLine = true;
      // add timeline after flapping
      addTimeline = true;
      let nextIndex = index + 1;
      if (filteredLogs[nextIndex][1] === serviceFlappingType) {
        nextIndex += 1;
      }

      pluginOutput = filteredLogs[nextIndex][3];
      state = getState(pluginOutput);
      pluginOutput = '';
    }

    // Found started log
    if (ignoreLine && stateType === stateTypeStarted) {
      ignoreLine = false;
      if (type === serviceFlappingType) {
        state = 'Flapping';
      }
      pluginOutput = '';
    }

    if ((!ignoreLine || addTimeline) && from <= until) {
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

      addResult(result, availabilty, timelines, timeline);

      // update until
      until = from;
    }
  }

  return timeline;
};

const generateServiceTimeline = async (
  server,
  port,
  hostName,
  serviceName,
  from,
  until
) => {
  try {
    const rangeFrom = moment(from);
    const rangeUntil = moment(until);

    // host data
    const hostData = await generateHostTimeline(
      server,
      port,
      hostName,
      from,
      until,
      ['HOST ALERT']
    );

    // get logs
    let command = getServiceLogsCommand(hostName, serviceName);
    let serviceLogs = await callServer(command, server, port);
    serviceLogs = filterLogs(serviceLogs, rangeFrom, rangeUntil);

    // get state
    command = getServiceStatesCommand(hostName, serviceName);
    let stateLogs = await callServer(command, server, port);
    stateLogs = filterLogsByDate(stateLogs, rangeFrom, rangeUntil);

    // init result
    let availabilty = {};
    const timelines = {};
    for (const state of serviceStateTypes) {
      availabilty[state] = 0;
      timelines[state] = [];
    }
    const rangeDuration = rangeFrom.diff(rangeUntil);

    let timeline = generateTimeline(
      rangeDuration,
      rangeUntil,
      serviceLogs,
      stateLogs,
      availabilty,
      timelines
    );

    // add timeline from rangeFrom
    const lastTimeline = timeline[timeline.length - 1];
    if (lastTimeline && lastTimeline.from > rangeFrom.format(displayFormat)) {
      generateTimelineOutsideLogs(
        serviceStateTypes,
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
    if (timeline.length === 0 && stateLogs.length > 1) {
      generateTimelineFromStates(
        serviceStateTypes,
        stateLogs,
        rangeFrom,
        rangeUntil,
        rangeDuration,
        availabilty,
        timelines,
        timeline
      );
    }

    const hostDownTimes = hostData.timelines.DOWN;
    if (timeline.length > 1 && hostDownTimes.length > 0) {
      timeline = addHostDown(
        timeline,
        timelines,
        availabilty,
        hostDownTimes,
        rangeDuration
      );
    }

    timelines['summary'] = timeline;
    availabilty = finalizeAvailability(availabilty);
    return { availabilty, timelines };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = generateServiceTimeline;
