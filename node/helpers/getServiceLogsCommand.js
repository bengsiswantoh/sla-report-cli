const getServiceLogsCommand = (hostName, serviceName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time type state_type plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + `Filter: service_description = ${serviceName}\n`;
  command = command + 'Filter: type ~ SERVICE\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

module.exports = getServiceLogsCommand;
