const checkStateFromNotification = (state, pluginOutput) => {
  let regexResult;

  // Flapping
  const regexFlappingStart = /FLAPPINGSTART \((\w+)\)/;
  regexResult = state.match(regexFlappingStart);
  if (regexResult) {
    state = 'Flapping';
    pluginOutput = '';
  }
  const regexFlappingStop = /FLAPPINGSTOP \((\w+)\)/;
  regexResult = state.match(regexFlappingStop);
  if (regexResult) {
    state = regexResult[1];
    pluginOutput = '';
  }

  // Downtime
  const regexDowntimeStart = /DOWNTIMESTART \((\w+)\)/;
  regexResult = state.match(regexDowntimeStart);
  if (regexResult) {
    state = 'Downtime';
    pluginOutput = '';
  }
  const regexDowntimeStop = /DOWNTIMEEND \((\w+)\)/;
  regexResult = state.match(regexDowntimeStop);
  if (regexResult) {
    state = regexResult[1];
    pluginOutput = '';
  }

  return { state, pluginOutput };
};

module.exports = checkStateFromNotification;
