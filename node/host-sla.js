const moment = require('moment');

// const generateHostAvailabilityFromNotifications = require('./helpers/generateHostAvailabilityFromNotifications');
const generateHostAvailabilityFromAlerts = require('./helpers/generateHostAvailabilityFromAlerts');

const { hostName, from, until, displayFormat } = require('./helpers/setting');

const hostAvailability = async (hostName, from, until) => {
  until = moment('2020-06-01 23:59:59');
  from = moment('2020-05-01 00:00:00');

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
    console.log('from', from.format(displayFormat));
    console.log('until', until.format(displayFormat));
  } catch (error) {
    console.log(error);
  }
};

hostAvailability(hostName, from, until);
