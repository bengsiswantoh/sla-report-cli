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

module.exports = getServiceStatesCommand;
