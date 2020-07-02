const checkState = (state, pluginOutput) => {
  let regexResult;

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

  return { state, pluginOutput };
};

module.exports = checkState;
