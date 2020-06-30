require('dotenv').config();
const moment = require('moment');
const callServer = require('./helpers/callServer');
const filterLogs = require('./helpers/filterLogs');
const getHostLogCommand = require('./helpers/getHostLogCommand');
const getServiceLogCommand = require('./helpers/getServiceLogCommand');
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
  const hostLogsCommand = getHostLogCommand(hostName);

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
  const serviceLogsCommand = getServiceLogCommand(hostName, serviceName);

  try {
    let hostLogs = await callServer(hostLogsCommand, 'host');
    const filteredHostLogs = filterLogs(hostLogs, from, until);
    const hostData = generateHostAvailability(
      filteredHostLogs,
      hostStateTypes,
      from,
      until
    );

    let serviceLogs = await callServer(serviceLogsCommand, 'service');
    const filteredServiceLogs = filterLogs(serviceLogs, from, until);
    const serviceData = generateServiceAvailability(
      filteredServiceLogs,
      hostData.timelines.DOWN,
      serviceStateTypes,
      from,
      until
    );

    console.log('data', serviceData.timelines.summary);
  } catch (error) {
    console.log(error);
  }
};

serviceAvailability('RO-Busol', 'Check_MK');
