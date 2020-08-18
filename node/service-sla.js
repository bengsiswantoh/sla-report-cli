const moment = require('moment');

const generateServiceAvailability = require('./helpers/generateServiceAvailability');

const {
  hostName,
  serviceName,
  from,
  until,
  displayFormat,
} = require('./helpers/setting');

const serviceAvailability = async (hostName, serviceName, from, until) => {
  from = moment(from);
  until = moment(until);

  try {
    const serviceData = await generateServiceAvailability(
      hostName,
      serviceName,
      from,
      until
    );

    // console.log('hostDataDown', hostData.timelines.DOWN);
    // console.log('timeline', serviceData.timelines['H.Down']);
    console.log('timeline', serviceData.timelines.summary);
    console.log('availability', serviceData.availabilty);

    console.log('host', hostName);
    console.log('service', serviceName);
    console.log('from', from.format(displayFormat));
    console.log('until', until.format(displayFormat));
  } catch (error) {
    console.log(error);
  }
};

serviceAvailability(hostName, serviceName, from, until);
