require('dotenv').config();
const net = require('net');

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

const main = async () => {
  let command = 'GET log\n';
  command =
    command +
    'Columns: host_name time service_description type state state_type message plugin_output\n';
  command = command + 'Filter: host_name = RO-Busol\n';
  // command = command + 'Filter: state_type = UP\n'
  // command = command + 'Filter: state_type = DOWN\n'
  // command = command + 'Filter: type = HOST NOTIFICATION\n'
  // command = command + 'Filter: type = SERVICE NOTIFICATION\n'
  command = command + 'OutputFormat: json\n';

  try {
    const result = await callServer(command);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

main();
