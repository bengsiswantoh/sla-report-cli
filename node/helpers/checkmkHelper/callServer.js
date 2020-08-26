const net = require('net');

const callServer = (command, host, port) => {
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

module.exports = callServer;
