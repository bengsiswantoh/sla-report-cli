require('dotenv').config();
const net = require('net');
const moment = require('moment');

const client = new net.Socket();
const host = process.env.HOST;
const port = process.env.PORT;

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
  command = command + `Filter: host_name = RO-Busol\n`;
  command = command + 'Filter: service_description = Check_MK\n';
  command = command + 'Filter: type = SERVICE NOTIFICATION\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const main = async () => {
  const command = getLogCommand();

  try {
    let result = await callServer(command);

    result = result.map((item) => {
      item[0] = moment.unix(item[0]).format('YYYY-MM-DD HH:mm:ss');
      return item;
    });

    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

main();
