require('dotenv').config();
const moment = require('moment');
const callServer = require('./helpers/callServer');
const filterLogs = require('./helpers/filterLogs');
const getHostNotificationCommand = require('./helpers/getHostNotificationsCommand');
const getServiceNotificationsCommand = require('./helpers/getServiceNotificationsCommand');
const generateHostAvailability = require('./helpers/generateHostAvailability');
const generateServiceAvailability = require('./helpers/generateServiceAvailability');

const serviceAvailability = async (hostName, serviceName) => {
  const until = moment();
  const from = moment().subtract(31, 'days');

  const hostStateTypes = [
    'UP',
    'DOWN',
    'UNREACH',
    'Flapping',
    'Downtime',
    'N/A',
  ];

  const serviceStateTypes = [
    'OK',
    'WARNING',
    'CRITICAL',
    'UNKNOWN',
    'Flapping',
    'H.Down',
    'Downtime',
    'N/A',
  ];

  try {
    let command = getHostNotificationCommand(hostName);
    let hostNotificationLogs = await callServer(command);
    const filteredHostLogs = filterLogs(hostNotificationLogs, from, until);
    const hostData = generateHostAvailability(
      filteredHostLogs,
      hostStateTypes,
      from,
      until
    );

    command = getServiceNotificationsCommand(hostName, serviceName);
    let serviceLogs = await callServer(command);
    const filteredServiceLogs = filterLogs(serviceLogs, from, until);
    const serviceData = generateServiceAvailability(
      filteredServiceLogs,
      hostData.timelines.DOWN,
      serviceStateTypes,
      from,
      until
    );

    console.log('timeline', serviceData.timelines.summary);
    console.log('availability', serviceData.availabilty);
  } catch (error) {
    console.log(error);
  }
};

serviceAvailability('RO-Busol', 'Check_MK');
