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

module.exports = callServer;
