const path = require('path');
const { jsonFromFile } = require('../test-helpers.js');

const f = (fileName) => path.resolve(__dirname, './type-samples/PreGracePluginData/', fileName);

module.exports = {
    getPreGraceData1: () => jsonFromFile(f('PreGracePluginData1.json'))
};