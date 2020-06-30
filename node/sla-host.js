require('dotenv').config();
const moment = require('moment');
const callServer = require('./helpers/callServer');
const filterLogs = require('./helpers/filterLogs');
const getHostLogCommand = require('./helpers/getHostLogCommand');
const generateHostAvailability = require('./helpers/generateHostAvailability');

const hostAvailability = async (hostName) => {
  const until = moment();
  const from = moment().subtract(31, 'days');

  const stateTypes = ['UP', 'DOWN', 'UNREACH', 'Flapping', 'Downtime', 'N/A'];

  const command = getHostLogCommand(hostName);

  try {
    let logs = await callServer(command);

    const filteredLogs = filterLogs(logs, from, until);

    const data = generateHostAvailability(
      filteredLogs,
      stateTypes,
      from,
      until
    );

    console.log('data', data);
  } catch (error) {
    console.log(error);
  }
};

hostAvailability('RO-Busol');
