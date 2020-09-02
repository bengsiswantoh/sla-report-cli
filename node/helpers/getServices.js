const { getServicesCommand } = require('./checkmkHelper/liveStatusCommand');
const callServer = require('./checkmkHelper/callServer');

const getServices = async (server, port) => {
  try {
    let command = getServicesCommand();
    const services = await callServer(command, server, port);

    return services;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = getServices;
