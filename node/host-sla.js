const moment = require('moment');

// const generateHostAvailabilityFromNotifications = require('./helpers/generateHostAvailabilityFromNotifications');
const generateHostAvailabilityFromAlerts = require('./helpers/generateHostAvailabilityFromAlerts');

const hostAvailability = async (hostName) => {
  // const until = moment();
  // const from = moment().subtract(31, 'days');
  // const from = moment().subtract(40, 'days');
  // const from = moment('2020-01-01 00:00:00');

  const until = moment('2020-06-01 23:59:59');
  const from = moment('2020-05-01 00:00:00');

  try {
    const data = await generateHostAvailabilityFromAlerts(
      hostName,
      from,
      until
    );

    console.log('timeline', data.timelines.summary);
    console.log('timeline', data.timelines.summary.length);
    console.log('availability', data.availabilty);
    console.log('host', hostName);
  } catch (error) {
    console.log(error);
  }
};

hostAvailability('rambutan');
