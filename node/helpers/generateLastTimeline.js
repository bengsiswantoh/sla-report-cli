const moment = require('moment');
require('dotenv').config();

const displayFormat = process.env.DISPLAY_FORMAT;
const dateFormat = process.env.DATE_FORMAT;

const generateLastTimeline = (
  type,
  stateLogs,
  lastTimeline,
  rangeFrom,
  rangeDuration,
  availabilty,
  timelines,
  timeline
) => {
  stateLogs = stateLogs.filter((item) => {
    const from = moment.unix(item[0]);
    return (
      from.format(dateFormat) === lastTimeline.fromMoment.format(dateFormat)
    );
  });

  const from = rangeFrom;
  const until = lastTimeline.fromMoment;
  const duration = (from.diff(until) / rangeDuration) * 100;
  let state;
  let pluginOutput;

  if (stateLogs.length > 0) {
    const stateLog = stateLogs[0];
    // TODO: change this hardcoded state
    switch (type) {
      case 'host':
        state = 'UP';
        break;
      case 'service':
        state = 'OK';
        break;
    }
    pluginOutput = stateLog[2];
  } else {
    state = 'N/A';
    pluginOutput = '';
  }

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

  availabilty[state] += duration;
  timelines[state].push(result);
  timeline.push(result);
};

module.exports = generateLastTimeline;
