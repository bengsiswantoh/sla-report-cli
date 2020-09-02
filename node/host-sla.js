require('dotenv').config();

const server = process.env.SERVER;
const port = process.env.PORT;

const generateHostTimeline = require('./helpers/generateHostTimeline');

const { hostName, from, until } = require('./helpers/checkmkHelper/setting');

const main = async () => {
  try {
    const data = await generateHostTimeline(
      server,
      port,
      hostName,
      from,
      until
    );

    // console.log('timeline', data.timelines.summary);
    // console.log('timeline', data.timelines.summary.length);
    console.log('availability', data.availabilty);

    console.log('host', hostName);
    console.log('from', from);
    console.log('until', until);
  } catch (error) {
    console.log(error);
  }
};

main();
