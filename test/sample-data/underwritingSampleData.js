const path = require('path');
const { jsonFromFile } = require('../test-helpers.js');

const resolve = (fileName) => path.resolve(__dirname, './type-samples/UnderwritingPluginData/', fileName);

module.exports = {
    getNewBusinessData: () => jsonFromFile(resolve('NewBusiness.json')),
    getEndorsementData: () => jsonFromFile(resolve('Endorsement.json'))
};