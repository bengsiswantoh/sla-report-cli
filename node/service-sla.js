const moment = require('moment');

// const callServer = require('./helpers/callServer');
// const filterLogs = require('./helpers/filterLogs');
// const getServiceNotificationsCommand = require('./helpers/getServiceNotificationsCommand');
// const getServiceStatesCommand = require('./helpers/getServiceStatesCommand');

const generateServiceAvailability = require('./helpers/generateServiceAvailability');

const serviceAvailability = async (hostName, serviceName) => {
  // const until = moment();
  // const from = moment().subtract(31, 'days');
  // const from = moment('2020-01-01 00:00:00');

  const until = moment('2020-07-01 23:59:59');
  const from = moment('2020-06-01 00:00:00');

  try {
    const serviceData = await generateServiceAvailability(
      hostName,
      serviceName,
      from,
      until
    );

    // console.log('hostDataDown', hostData.timelines.DOWN);
    // console.log('timeline', serviceData.timelines['H.Down']);
    // console.log('timeline', serviceData.timelines.summary);
    // console.log('availability', serviceData.availabilty);
    console.log('service', hostName, serviceName);
  } catch (error) {
    console.log(error);
  }
};

serviceAvailability('RO-Busol', 'Check_MK');
