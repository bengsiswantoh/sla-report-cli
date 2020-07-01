const net = require('net');
const moment = require('moment');
require('dotenv').config();

const host = process.env.HOST;
const port = process.env.PORT;

const callServer = (command) => {
  return new Promise((resolve, reject) => {
    let result = [];
    const client = new net.Socket();

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

const main = async () => {
  let command = 'GET log\n';
  command =
    command +
    'Columns: time host_name service_description type state state_type message plugin_output\n';
  command = command + 'Filter: host_name = RO-Busol\n';
  command = command + 'Filter: service_description = Check_MK\n';
  command = command + 'Filter: type = SERVICE NOTIFICATION\n';
  command = command + 'Limit: 3\n';
  command = command + 'ColumnHeaders: on\n';
  command = command + 'OutputFormat: json\n';

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
