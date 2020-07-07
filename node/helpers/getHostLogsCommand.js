const getHostLogsCommand = (hostName) => {
  let command = 'GET log\n';
  command = command + 'Columns: time type state_type plugin_output\n';
  command = command + `Filter: host_name = ${hostName}\n`;
  command = command + 'Filter: type ~ HOST\n';
  command = command + 'OutputFormat: json\n';

  return command;
};

module.exports = getHostLogsCommand;
