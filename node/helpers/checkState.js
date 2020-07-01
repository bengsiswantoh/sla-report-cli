const checkState = (state) => {
  let regexResult;

  const regexFlappingStart = /FLAPPINGSTART \((\w+)\)/;
  regexResult = state.match(regexFlappingStart);
  if (regexResult) {
    state = 'Flapping';
  }
  const regexFlappingStop = /FLAPPINGSTOP \((\w+)\)/;
  regexResult = state.match(regexFlappingStop);
  if (regexResult) {
    state = regexResult[1];
  }

  return state;
};

module.exports = checkState;
