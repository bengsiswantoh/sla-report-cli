const filterLogs = (logs, rangeFrom, rangeUntil) => {
  let lastIndex;

  filteredLogs = logs.filter((item, index) => {
    const from = item[0];
    const firstCondition = from > rangeFrom.unix();
    const keepCondition = firstCondition && from < rangeUntil.unix();
    if (!firstCondition && !lastIndex) {
      lastIndex = index;
    }

    return keepCondition;
  });

  if (lastIndex) {
    const log = logs[lastIndex];
    log[0] = rangeFrom.unix();
    filteredLogs = [...filteredLogs, log];
  }

  return filteredLogs;
};

module.exports = filterLogs;
