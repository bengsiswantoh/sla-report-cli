require('dotenv').config();
const moment = require('moment');
const callServer = require('./helpers/callServer');
const filterLogs = require('./helpers/filterLogs');
const generateAvailability = require('./helpers/generateAvailability');

const getHostLogCommand = (hostName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time state_type plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + 'Filter: type = HOST NOTIFICATION\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const availabilityHost = async (hostName) => {
  const until = moment();
  const from = moment().subtract(31, 'days');

  const stateTypes = ['UP', 'DOWN', 'UNREACH', 'Flapping', 'Downtime', 'N/A'];

  const command = getHostLogCommand(hostName);

  try {
    let logs = await callServer(command);

    const filteredLogs = filterLogs(logs, from, until);

    const data = generateAvailability(filteredLogs, stateTypes, from, until);

    console.log('data', data);
  } catch (error) {
    console.log(error);
  }
};

availabilityHost('RO-Busol');
