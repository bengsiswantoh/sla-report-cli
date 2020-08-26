require('dotenv').config();

const server = process.env.SERVER;
const port = process.env.PORT;

const {
  generateServiceTimeline,
} = require('./helpers/generateServiceTimeline');

const {
  hostName,
  serviceName,
  from,
  until,
  displayFormat,
} = require('./helpers/checkmkHelper/setting');

const serviceAvailability = async () => {
  try {
    const serviceData = await generateServiceTimeline(
      server,
      port,
      hostName,
      serviceName,
      from,
      until
    );

    // console.log('hostDataDown', hostData.timelines.DOWN);
    // console.log('timeline', serviceData.timelines['H.Down']);
    // console.log('timeline', serviceData.timelines.summary);
    console.log('availability', serviceData.availabilty);

    console.log('host', hostName);
    console.log('service', serviceName);
    console.log('from', from.format(displayFormat));
    console.log('until', until.format(displayFormat));
  } catch (error) {
    console.log(error);
  }
};

serviceAvailability();
