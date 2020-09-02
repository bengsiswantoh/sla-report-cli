const getHostsCommand = () => {
  let command = 'GET hosts\n';
  command = command + 'Columns: name\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const getServicesCommand = () => {
  let command = 'GET services\n';
  command = command + 'Columns: host_name description \n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const getHostLogsCommand = (hostName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time type state_type plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + 'Filter: type ~ HOST\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const getHostStatesCommand = (hostName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time state_type plugin_output state\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + 'Filter: type = CURRENT HOST STATE\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const getServiceLogsCommand = (hostName, serviceName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time type state_type plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + `Filter: service_description = ${serviceName}\n`;
  command = command + 'Filter: type ~ SERVICE\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

const getServiceStatesCommand = (hostName, serviceName) => {
  let command = 'GET log\n';
  command =
    command +
    'Columns: time state_type plugin_output service_description host_name\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + `Filter: service_description = ${serviceName}\n`;
  command = command + 'Filter: type = CURRENT SERVICE STATE\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

module.exports = {
  getHostsCommand,
  getServicesCommand,
  getHostLogsCommand,
  getHostStatesCommand,
  getServiceLogsCommand,
  getServiceStatesCommand,
};
