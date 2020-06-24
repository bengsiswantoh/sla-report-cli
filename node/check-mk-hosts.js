require('dotenv').config();
const net = require('net');

const host = process.env.HOST;
const port = process.env.PORT;

// let client = new net.Socket();
// client.connect(6557, '202.6.234.77', () => {
//   // console.log('Connected');
//   // client.write('Hello, server! Love, Client.');
// });

// client.on('data', (data) => {
//   // console.log(data.toString());
//   var parsed = JSON.parse(data.toString());
//   console.log(parsed);
// });

// var command = 'GET hosts\n';
// command = command + 'Columns: name\n';
// command = command + 'OutputFormat: json\n';

// client.write(command);
// client.end();

callServer = (command) => {
  return new Promise((resolve, reject) => {
    resolve(command);
    // const client = new net.Socket();
    // client.connect(port, host, () => {
    //   client.write(command);
    // });
    // client.on('data', (data) => {
    //   var parsed = JSON.parse(data.toString());
    //   console.log(parsed);
    //   resolve(command);
    //   client.destroy();
    // });
    // client.on('error', reject);
  });
};

// function callServer(formattedJson) {
//   return new Promise((resolve, reject) => {
//     let client = new net.Socket();

//     client.connect(port, host, () => {
//       console.log('connected to server');
//       client.write(formattedJson);
//     });

//     client.on('data', (data) => {
//       resolve(data);
//       client.destroy();
//     });

//     client.on('close', () => {});

//     client.on('error', reject);
//   });
// }

main = async () => {
  let command = 'GET hosts\n';
  command = command + 'Columns: name\n';
  command = command + 'OutputFormat: json\n';
  try {
    result = await callServer(command);
    console.log(result);
  } catch (error) {}
};

main();
