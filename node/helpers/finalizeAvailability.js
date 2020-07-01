const finalizeAvailability = (availability) => {
  for (const key in availability) {
    availability[key] = availability[key].toFixed(2);
  }

  return availability;
};

module.exports = finalizeAvailability;
