const moment = require('moment');
const callServer = require('./helpers/callServer');
const filterLogs = require('./helpers/filterLogs');
const getHostNotificationsCommand = require('./helpers/getHostNotificationsCommand');
const getHostStatesCommand = require('./helpers/getHostStatesCommand');
const generateHostAvailability = require('./helpers/generateHostAvailability');
const getServiceNotificationsCommand = require('./helpers/getServiceNotificationsCommand');
const getServiceStatesCommand = require('./helpers/getServiceStatesCommand');
const generateServiceAvailability = require('./helpers/generateServiceAvailability');

const serviceAvailability = async (hostName, serviceName) => {
  const until = moment();
  const from = moment().subtract(31, 'days');
  // const from = moment('2020-01-01 00:00:00');

  try {
    // host data
    const hostStateTypes = [
      'UP',
      'DOWN',
      'UNREACH',
      'Flapping',
      'Downtime',
      'N/A',
    ];

    let command = getHostNotificationsCommand(hostName);
    let hostNotificationLogs = await callServer(command);
    hostNotificationLogs = filterLogs(hostNotificationLogs, from, until);

    command = getHostStatesCommand(hostName);
    let hostStateLogs = await callServer(command);
    hostStateLogs = filterLogs(hostStateLogs, from, until);

    const hostData = generateHostAvailability(
      hostNotificationLogs,
      hostStateLogs,
      hostStateTypes,
      from,
      until
    );

    // service data
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

    command = getServiceNotificationsCommand(hostName, serviceName);
    let serviceNotificationLogs = await callServer(command);
    serviceNotificationLogs = filterLogs(serviceNotificationLogs, from, until);

    command = getServiceStatesCommand(hostName, serviceName);
    let serviceStateLogs = await callServer(command);
    serviceStateLogs = filterLogs(serviceStateLogs, from, until);

    const serviceData = generateServiceAvailability(
      serviceNotificationLogs,
      serviceStateLogs,
      hostData.timelines.DOWN,
      serviceStateTypes,
      from,
      until
    );

    console.log('timeline', serviceData.timelines.summary);
    console.log('availability', serviceData.availabilty);
    console.log('service', hostName, serviceName);
  } catch (error) {
    console.log(error);
  }
};

serviceAvailability('RO-Busol', 'Check_MK');
