const moment = require('moment');
const callServer = require('./helpers/callServer');
const filterLogs = require('./helpers/filterLogs');
const getHostNotificationsCommand = require('./helpers/getHostNotificationsCommand');
const getHostStatesCommand = require('./helpers/getHostStatesCommand');
const generateHostAvailabilityFromNotifications = require('./helpers/generateHostAvailabilityFromNotifications');

const hostAvailability = async (hostName) => {
  const until = moment();
  const from = moment().subtract(31, 'days');
  // const from = moment('2020-01-01 00:00:00');

  // const until = moment('2020-05-31 23:59:59');
  // const from = moment('2020-05-01 00:00:00');

  try {
    const data = await generateHostAvailabilityFromNotifications(
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

hostAvailability('RO-Busol');
