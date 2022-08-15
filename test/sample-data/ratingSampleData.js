const path = require('path');
const { jsonFromFile } = require('../test-helpers.js');

const f = (fileName) => path.resolve(__dirname, './type-samples/RatingPluginData/', fileName);

module.exports = {
    getNewBusinessData1: () => jsonFromFile(f('NewBusiness1.json')),
    getNewBusinessData2: () => jsonFromFile(f('NewBusiness2.json')),
    getEndorsementData1: () => jsonFromFile(f('Endorsement1.json')),
    getEndorsementData2: () => jsonFromFile(f('Endorsement2.json')),
};