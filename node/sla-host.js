const moment = require('moment');
const callServer = require('./helpers/callServer');
const filterLogs = require('./helpers/filterLogs');
const getHostNotificationsCommand = require('./helpers/getHostNotificationsCommand');
const getHostStatesCommand = require('./helpers/getHostStatesCommand');
const generateHostAvailability = require('./helpers/generateHostAvailability');

const hostAvailability = async (hostName) => {
  const until = moment();
  // const from = moment().subtract(31, 'days');
  const from = moment('2020-01-01 00:00:00');

  const stateTypes = ['UP', 'DOWN', 'UNREACH', 'Flapping', 'Downtime', 'N/A'];

  try {
    let command = getHostNotificationsCommand(hostName);
    let notificationLogs = await callServer(command);
    notificationLogs = filterLogs(notificationLogs, from, until);

    command = getHostStatesCommand(hostName);
    let stateLogs = await callServer(command);
    // console.log(stateLogs);
    stateLogs = filterLogs(stateLogs, from, until);

    const data = generateHostAvailability(
      notificationLogs,
      stateLogs,
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

// hostAvailability('Tambora_FS_Main');
hostAvailability('RO-Busol');
