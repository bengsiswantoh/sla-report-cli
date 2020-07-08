const hostFlappingType = 'HOST FLAPPING ALERT';
const hostDowntimeType = 'HOST DOWNTIME ALERT';

const serviceFlappingType = 'SERVICE FLAPPING ALERT';

module.exports = {
  displayFormat: 'YYYY-MM-DD HH:mm:ss',
  dateFormat: 'YYYY-MM-DD',

  NAState: 'N/A',
  stateTypeStarted: 'STARTED',
  stateTypeStopped: 'STOPPED',

  hostStateTypes: ['UP', 'DOWN', 'UNREACH', 'Flapping', 'Downtime', 'N/A'],
  hostFilterTypes: ['HOST ALERT', hostFlappingType, hostDowntimeType],
  // hostFilterTypes: ['HOST ALERT', hostFlappingType],
  // hostFilterTypes: ['HOST ALERT'],
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
