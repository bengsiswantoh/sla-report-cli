const net = require('net');
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
  let command = 'GET hosts\n';
  command = command + 'Columns: name\n';
  command = command + 'ColumnHeaders: on\n';
  command = command + 'OutputFormat: json\n';

  try {
    const result = await callServer(command);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

main();
