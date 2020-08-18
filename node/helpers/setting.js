const hostFlappingType = 'HOST FLAPPING ALERT';
const hostDowntimeType = 'HOST DOWNTIME ALERT';

const serviceFlappingType = 'SERVICE FLAPPING ALERT';

module.exports = {
  hostName: 'RO-Busol',
  serviceName: 'Check_MK',
  from: '2020-07-01 00:00:00',
  until: '2020-08-02 00:00:00',

  displayFormat: 'YYYY-MM-DD HH:mm:ss',
  dateFormat: 'YYYY-MM-DD',

  NAState: 'N/A',
  stateTypeStarted: 'STARTED',
  stateTypeStopped: 'STOPPED',

  hostStateTypes: ['UP', 'DOWN', 'UNREACH', 'Flapping', 'Downtime', 'N/A'],
  hostFilterTypes: ['HOST ALERT', hostFlappingType, hostDowntimeType],

  hostFlappingType,
  hostDowntimeType,

  serviceStateTypes: [
    'OK',
    'WARNING',
    'CRITICAL',
    'UNKNOWN',
    'Flapping',
    'H.Down',
    'Downtime',
    'N/A',
  ],
  serviceFilterTypes: ['SERVICE ALERT', serviceFlappingType],

  serviceFlappingType,
};
