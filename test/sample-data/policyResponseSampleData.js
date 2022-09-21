const path = require('path');
const { jsonFromFile } = require('../test-helpers.js');

const resolve = (fileName) => path.resolve(__dirname, './type-samples/PolicyResponse/', fileName);

module.exports = {
    getPolicyResponse1: () => jsonFromFile(resolve('PolicyResponse1.json')),

    // Sample policy with multiple perils, not all of which begin and end at the same time.
    // Coverages on three cars:
    //     Car 1: 1664596800000 to 1696132800000 (10/1/22 to 10/1/2023)
    //     Car 2: 1667275200000 to 1696132800000 (11/1/22 to 10/1/2023)
    //     Car 3: 1672549200000 to 1682913600000 (1/1/23 to 5/1/2023)
    getPolicyResponse2: () => jsonFromFile(resolve('PolicyResponse2.json')),

    // Sample policy with one exposure with one peril
    //     Car: 1664596800000 to 1696132800000 (10/1/2022 to 10/1/2023)
    getPolicyResponse3: () => jsonFromFile(resolve('PolicyResponse3.json'))
};