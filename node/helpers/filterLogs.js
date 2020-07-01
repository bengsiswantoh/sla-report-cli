const filterLogs = (logs, rangeFrom, rangeUntil) => {
  filteredLogs = logs.filter((item) => {
    const from = item[0];
    return from > rangeFrom.unix() && from < rangeUntil.unix();
  });

  return filteredLogs;
};

module.exports = filterLogs;
