require('dotenv').config();

const server = process.env.SERVER;
const port = process.env.PORT;

const getServices = require('./helpers/getServices');

const main = async () => {
  try {
    const data = await getServices(server, port);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

main();
