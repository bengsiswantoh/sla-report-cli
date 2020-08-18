const moment = require('moment');

const generateHostAvailabilityFromAlerts = require('./generateHostAvailabilityFromAlerts');

const callServer = require('./callServer');
const { filterLogs, filterLogsByDate } = require('./filterLogs');
const getServiceLogsCommand = require('./getServiceLogsCommand');
const getServiceStatesCommand = require('./getServiceStatesCommand');

const generateTimelineOutsideLogs = require('./generateTimelineOutsideLogs');
const generateTimelineFromStates = require('./generateTimelineFromStates');
const finalizeAvailability = require('./finalizeAvailability');

const {
  displayFormat,
  dateFormat,
  serviceStateTypes,
  serviceFilterTypes,
  serviceFlappingType,
  stateTypeStarted,
  stateTypeStopped,
} = require('./setting');

const addResult = (result, availabilty, timelines, timeline) => {
  availabilty[result.state] += result.durationFloat;
  timelines[result.state].push(result);
  timeline.push(result);
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

  return state;
};

const generateTimeline = (
  rangeDuration,
  rangeUntil,
  logs,
  hostDownTimes,
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

      if (hostDownTime || hostDownTimes.length > 0) {
        if (!hostDownTime) {
          hostDownTime = hostDownTimes.shift();
        }

        // FIXME: harusnya ada host down, ternyata di host ada flapping
        // {
        //   fromMoment: Moment<2020-07-17T09:19:01+07:00>,
        //   from: '2020-07-17 09:19:01',
        //   untilMoment: Moment<2020-07-17T09:34:35+07:00>,
        //   until: '2020-07-17 09:34:35',
        //   durationFloat: 0.0337818287037037,
        //   duration: '0.03%',
        //   state: 'Flapping',
        //   pluginOutput: ''
        // },
        // {
        //   fromMoment: Moment<2020-07-17T09:19:01+07:00>,
        //   from: '2020-07-17 09:19:01',
        //   untilMoment: Moment<2020-07-17T09:19:01+07:00>,
        //   until: '2020-07-17 09:19:01',
        //   durationFloat: -0,
        //   duration: '0.00%',
        //   state: 'OK',
        //   pluginOutput: 'OK - execution time 55.9 sec'
        // },

        while (hostDownTime && hostDownTime.untilMoment > from) {
          const resultBefore = { ...result };
          result.fromMoment = hostDownTime.untilMoment;
          result.from = hostDownTime.until;
          result.durationFloat =
            (result.fromMoment.diff(result.untilMoment) / rangeDuration) * 100;
          result.duration = `${result.durationFloat.toFixed(2)}%`;
          addResult(result, availabilty, timelines, timeline);

          result = { ...hostDownTime, state: 'H.Down' };

          if (from > result.fromMoment) {
            from = result.fromMoment;
          } else {
            addResult(result, availabilty, timelines, timeline);
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

      addResult(result, availabilty, timelines, timeline);

      // update until
      until = from;
    }
  }

  return timeline;
};

const generateServiceAvailability = async (
  hostName,
  serviceName,
  rangeFrom,
  rangeUntil
) => {
  // host data
  const hostData = await generateHostAvailabilityFromAlerts(
    hostName,
    rangeFrom,
    rangeUntil,
    ['HOST ALERT']
  );

  // get logs
  let command = getServiceLogsCommand(hostName, serviceName);
  let serviceLogs = await callServer(command);
  serviceLogs = filterLogs(serviceLogs, rangeFrom, rangeUntil);

  // get state
  command = getServiceStatesCommand(hostName, serviceName);
  let stateLogs = await callServer(command);
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
    hostData.timelines.DOWN,
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
  if (timeline.length === 0) {
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

  timelines['summary'] = timeline;
  availabilty = finalizeAvailability(availabilty);
  return { availabilty, timelines };
};

module.exports = generateServiceAvailability;
