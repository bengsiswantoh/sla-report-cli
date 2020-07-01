const getHostNotificationsCommand = (hostName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time state_type plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + 'Filter: type = HOST NOTIFICATION\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

module.exports = getHostNotificationsCommand;
