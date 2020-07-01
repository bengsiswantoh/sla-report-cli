const getServiceNotificationsCommand = (hostName, serviceName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time state_type plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + `Filter: service_description = ${serviceName}\n`;
  command = command + 'Filter: type = SERVICE NOTIFICATION\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

module.exports = getServiceNotificationsCommand;
