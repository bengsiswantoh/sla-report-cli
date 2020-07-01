require('dotenv').config();
const moment = require('moment');
const callServer = require('./helpers/callServer');
const filterLogs = require('./helpers/filterLogs');
const getHostNotificationsCommand = require('./helpers/getHostNotificationsCommand');
const generateHostAvailability = require('./helpers/generateHostAvailability');

const hostAvailability = async (hostName) => {
  const until = moment();
  const from = moment().subtract(31, 'days');

  const stateTypes = ['UP', 'DOWN', 'UNREACH', 'Flapping', 'Downtime', 'N/A'];

  try {
    let command = getHostNotificationsCommand(hostName);
    let notificationLogs = await callServer(command);

    const filteredNotificationLogs = filterLogs(notificationLogs, from, until);

    const data = generateHostAvailability(
      filteredNotificationLogs,
      stateTypes,
      from,
      until
    );

    console.log('timeline', data.timelines.summary);
    console.log('availability', data.availabilty);
  } catch (error) {
    console.log(error);
  }
};

hostAvailability('RO-Busol');
