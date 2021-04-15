const config = require('../config.json');

const errors = [
  {
    name: 'no-seeds',
    message: `There are currently no seeds set up! use \`${config.prefix} add-seed <seed> <size>\` to add one`
  },
  {
    name: 'invalid-seed',
    message: `Not a valid seed`
  },
  {
    name: 'invalid-map-size',
    message: 'Not a valid size! Use between 100 & 6000',
  },
  {
    name: 'empty-seed',
    message: `This command requires a seed! Use \`${config.prefix} add-seed <seed> <size>\` to add one!`,
  }
];

const getErrorMsg = (name) => errors.find((error) => error.name === name);
const sendErrorMsg = (msg, name) => msg.channel.send(getErrorMsg(name));

exports.sendErrorMsg = sendErrorMsg;
