const moment = require('moment');

const { dateFormat } = require('./setting');

const filterLogs = (logs, rangeFrom, rangeUntil) => {
  let filteredLogs = logs.filter((item) => {
    const from = item[0];
    return from >= rangeFrom.unix() && from <= rangeUntil.unix();
  });

  return filteredLogs;
};

const filterLogsByDate = (logs, rangeFrom, rangeUntil) => {
  let filteredLogs = logs.filter((item) => {
    const from = moment.unix(item[0]);
    return (
      from.format(dateFormat) >= rangeFrom.format(dateFormat) &&
      from.format(dateFormat) <= rangeUntil.format(dateFormat)
    );
  });

  return filteredLogs;
};

module.exports = { filterLogs, filterLogsByDate };
