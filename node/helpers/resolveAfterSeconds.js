const resolveAfterSeconds = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('resolved');
    }, seconds * 1000);
  });
};

module.exports = resolveAfterSeconds;
