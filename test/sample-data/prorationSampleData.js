const path = require('path');
const { jsonFromFile } = require('../test-helpers.js');

const f = (fileName) => path.resolve(__dirname, './type-samples/ProrationPluginData/', fileName);

module.exports = {
  getEndorsement1: () => jsonFromFile(f('Endorsement1.json')),
  getEndorsement2: () => jsonFromFile(f('Endorsement2.json')),
};
