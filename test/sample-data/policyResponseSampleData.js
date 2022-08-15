const path = require('path');
const { jsonFromFile } = require('../test-helpers.js');

const resolve = (fileName) => path.resolve(__dirname, './type-samples/PolicyResponse/', fileName);

module.exports = {
    getPolicyResponse1: () => jsonFromFile(resolve('PolicyResponse1.json'))
};