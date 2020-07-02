const moment = require('moment');

const filterLogs = (logs, rangeFrom, rangeUntil) => {
  const rangeFilterFrom = rangeFrom.clone().startOf('date');
  const rangeFilterUntil = rangeUntil.clone().startOf('date');

  filteredLogs = logs.filter((item) => {
    const from = item[0];
    return from >= rangeFilterFrom.unix() && from <= rangeFilterUntil.unix();
  });

  return filteredLogs;
};

module.exports = filterLogs;
