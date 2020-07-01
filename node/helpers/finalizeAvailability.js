const finalizeAvailability = (availability) => {
  for (const key in availability) {
    availability[key] = Math.round(availability[key]);
  }

  return availability;
};

module.exports = finalizeAvailability;
