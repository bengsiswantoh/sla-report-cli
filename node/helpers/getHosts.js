const { getHostsCommand } = require('./checkmkHelper/liveStatusCommand');
const callServer = require('./checkmkHelper/callServer');

const getHosts = async (server, port) => {
  try {
    let command = getHostsCommand();
    const hosts = await callServer(command, server, port);

    return hosts;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = getHosts;
