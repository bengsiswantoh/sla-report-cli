const moment = require('moment');

const generateHostAvailabilityFromAlerts = require('./generateHostAvailabilityFromAlerts');

const callServer = require('./callServer');
const { filterLogs, filterLogsByDate } = require('./filterLogs');
const getServiceLogsCommand = require('./getServiceLogsCommand');
const getServiceStatesCommand = require('./getServiceStatesCommand');

// const checkState = require('./checkState');
// const generateTimelineOutsideNotifications = require('./generateTimelineOutsideNotifications');
// const generateTimelineFromStates = require('./generateTimelineFromStates');
// const finalizeAvailability = require('./finalizeAvailability');

const {
  displayFormat,
  dateFormat,
  serviceStateTypes,
  serviceFilterTypes,
  serviceFlappingType,
  serviceWarningStates,
  serviceCriticalStates,
} = require('./setting');

// const addResultBottom = (
//   hostDownTimeline,
//   until,
//   rangeDuration,
//   state,
//   pluginOutput,
//   availabilty,
//   timelines,
//   timeline
// ) => {
//   const fromBottom = hostDownTimeline.untilMoment;
//   const durationBottom = (fromBottom.diff(until) / rangeDuration) * 100;

//   // resultBottom
//   let resultBottom = {
//     fromMoment: fromBottom,
//     from: fromBottom.format(displayFormat),
//     untilMoment: until,
//     until: until.format(displayFormat),
//     durationFloat: durationBottom,
//     duration: `${durationBottom.toFixed(2)}%`,
//     state,
//     pluginOutput,
//   };
//   availabilty[state] += parseFloat(durationBottom);
//   timelines[state].push(resultBottom);
//   timeline.push(resultBottom);
// };

// const addHostDown = (hostDownTimeline, availabilty, timelines, timeline) => {
//   const hostDownState = 'H.Down';
//   hostDownTimeline.state = hostDownState;

//   availabilty[hostDownState] += hostDownTimeline.durationFloat;
//   timelines[hostDownState].push(hostDownTimeline);
//   timeline.push(hostDownTimeline);
// };

// const modifyResult = (result, hostDownTimeline, rangeDuration) => {
//   result.untilMoment = hostDownTimeline.fromMoment;
//   result.until = hostDownTimeline.from;

//   const duration =
//     (result.fromMoment.diff(result.untilMoment) / rangeDuration) * 100;
//   result.durationFloat = duration;
//   result.duration = `${duration.toFixed(2)}%`;

//   return result;
// };

const getState = (pluginOutput) => {
  let state = pluginOutput.split(' ')[0];

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
  stateLogs,
  availabilty,
  timelines
) => {
  let isFlapping;
  let until = rangeUntil;
  const timeline = [];

  // filter logs
  const filteredLogs = logs.filter((item) =>
    serviceFilterTypes.includes(item[1])
  );

  for (let index = 0; index < logs.length; index++) {
    const item = logs[index];

    const from = moment.unix(item[0]);
    const duration = (from.diff(until) / rangeDuration) * 100;

    const type = item[1];
    const stateType = item[2];

    let pluginOutput = item[3];
    let state = getState(pluginOutput);

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
    console.log(result);

    // update data
    availabilty[state] += duration;
    timelines[state].push(result);
    timeline.push(result);

    // update until
    until = from;
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
    rangeUntil
  );
  // console.log(hostData.timelines.DOWN);

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

  const timeline = generateTimeline(
    rangeDuration,
    rangeUntil,
    serviceLogs,
    stateLogs,
    availabilty,
    timelines
  );
  // let hostDownTimeline;
  // notificationLogs.map((item) => {
  //   const from = moment.unix(item[0]);
  //   const duration = (from.diff(until) / rangeDuration) * 100;
  //   const { state, pluginOutput } = checkState(item[1], item[2]);
  //   let result = {
  //     fromMoment: from,
  //     from: from.format(displayFormat),
  //     untilMoment: until,
  //     until: until.format(displayFormat),
  //     durationFloat: duration,
  //     duration: `${duration.toFixed(2)}%`,
  //     state,
  //     pluginOutput,
  //   };
  //   // check host down timeline
  //   if (hostDownTimeline || hostDownTimelines.length > 0) {
  //     if (!hostDownTimeline) {
  //       hostDownTimeline = hostDownTimelines.shift();
  //     }
  //     while (
  //       hostDownTimeline &&
  //       from.format(displayFormat) < hostDownTimeline.from
  //     ) {
  //       if (until.format(displayFormat) > hostDownTimeline.until) {
  //         addResultBottom(
  //           hostDownTimeline,
  //           until,
  //           rangeDuration,
  //           state,
  //           pluginOutput,
  //           availabilty,
  //           timelines,
  //           timeline
  //         );
  //       }
  //       addHostDown(hostDownTimeline, availabilty, timelines, timeline);
  //       result = modifyResult(result, hostDownTimeline, rangeDuration);
  //       until = result.untilMoment;
  //       hostDownTimeline = hostDownTimelines.shift();
  //     }
  //   }
  //   // update until
  //   until = from;
  //   // update data
  //   availabilty[state] += result.durationFloat;
  //   timelines[state].push(result);
  //   timeline.push(result);
  //   return null;
  // });

  // // add timeline from rangeFrom
  // const lastTimeline = timeline[timeline.length - 1];
  // if (lastTimeline && lastTimeline.from > rangeFrom.format(displayFormat)) {
  //   generateTimelineOutsideNotifications(
  //     stateTypes,
  //     stateLogs,
  //     lastTimeline,
  //     rangeFrom,
  //     rangeDuration,
  //     availabilty,
  //     timelines,
  //     timeline
  //   );
  // }
  // // generate timeline no notification
  // if (timeline.length === 0) {
  //   generateTimelineFromStates(
  //     stateTypes,
  //     stateLogs,
  //     rangeFrom,
  //     rangeUntil,
  //     rangeDuration,
  //     availabilty,
  //     timelines,
  //     timeline
  //   );
  // }
  // timelines['summary'] = timeline;
  // availabilty = finalizeAvailability(availabilty);
  // return { availabilty, timelines };
};

module.exports = generateServiceAvailability;
