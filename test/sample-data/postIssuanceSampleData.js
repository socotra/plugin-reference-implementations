const path = require('path');
const { jsonFromFile } = require('../test-helpers.js');

const f = (fileName) => path.resolve(__dirname, './type-samples/PostIssuancePluginData/', fileName);

module.exports = {
    getPostIssuanceData1: () => jsonFromFile(f('PostIssuanceData1.json'))
};