require('dotenv').config();
const net = require('net');
const moment = require('moment');

const client = new net.Socket();
const host = process.env.HOST;
const port = process.env.PORT;
const displayFormat = 'YYYY-MM-DD HH:mm:ss';

const callServer = (command) => {
  return new Promise((resolve, reject) => {
    let result = [];

    client.connect(port, host, () => {
      client.write(command);
      client.end();
    });

    client.on('data', (data) => {
      const dataString = data.toString();
      result.push(dataString);
    });

    client.on('close', function () {
      const resultString = result.join('');
      const resultParsed = JSON.parse(resultString);
      resolve(resultParsed);
    });

    client.on('error', reject);
  });
};

const getLogCommand = (hostName, service) => {
  let command = 'GET log\n';
  command =
    command +
    'Columns: time host_name service_description type state state_type message plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  if (service) {
    command = command + `Filter: service_description = ${service}\n`;
  }
  // command = command + 'Filter: type = SERVICE NOTIFICATION\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const getHostLogCommand = (hostName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time state_type plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + 'Filter: type = HOST NOTIFICATION\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const filterLogs = (logs, rangeFrom, rangeUntil) => {
  let lastIndex;

  filteredLogs = logs.filter((item, index) => {
    const from = item[0];
    const firstCondition = from > rangeFrom.unix();
    const keepCondition = firstCondition && from < rangeUntil.unix();
    if (!firstCondition && !lastIndex) {
      lastIndex = index;
    }

    return keepCondition;
  });

  if (lastIndex) {
    const log = logs[lastIndex];
    log[0] = rangeFrom.unix();
    filteredLogs = [...filteredLogs, log];
  }

  return filteredLogs;
};

const formatHostTimeline = (logs, rangeFrom, rangeUntil) => {
  const stateTypes = ['UP', 'DOWN', 'UNREACH', 'Flapping', 'Downtime', 'N/A'];

  let until = rangeUntil;
  const rangeDuration = rangeFrom.diff(rangeUntil);

  const data = {};

  for (const state of stateTypes) {
    data[state] = 0;
    data[`timeline-${state}`] = [];
  }

  timeline = logs.map((item) => {
    const from = moment.unix(item[0]);
    let state = item[1];
    switch (state) {
      case 'FLAPPINGSTART (DOWN)':
        state = 'Flapping';
        break;
      case 'FLAPPINGSTART (UP)':
        state = 'Flapping';
        break;
      case 'FLAPPINGSTOP (UP)':
        state = 'UP';
        break;
    }
    const pluginOutput = item[2];
    let duration = (from.diff(until) / rangeDuration) * 100;
    duration = duration.toFixed(2);

    const result = {
      from: from.format(displayFormat),
      until: until.format(displayFormat),
      duration: `${duration}%`,
      state,
      pluginOutput,
    };

    // update until
    until = from;

    // update data
    data[state] += parseFloat(duration);
    data[`timeline-${state}`].push(result);

    return result;
  });

  data['timeline'] = timeline;

  return data;
};

const availabilityHost = async (hostName) => {
  const until = moment();
  const from = moment().subtract(31, 'days');

  const command = getHostLogCommand(hostName);

  try {
    let logs = await callServer(command);

    const filteredLogs = filterLogs(logs, from, until);

    const data = formatHostTimeline(filteredLogs, from, until);

    console.log('data', data);
  } catch (error) {
    console.log(error);
  }
};

availabilityHost('RO-Busol');
