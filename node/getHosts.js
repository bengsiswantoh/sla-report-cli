require('dotenv').config();

const server = process.env.SERVER;
const port = process.env.PORT;

const getHosts = require('./helpers/getHosts');

const main = async () => {
  try {
    const data = await getHosts(server, port);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

main();
