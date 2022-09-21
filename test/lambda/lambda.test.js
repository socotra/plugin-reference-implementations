const { executeLambda } = require('../../scripts/lambda/lambda.js');

describe('Basic Lambda plugin behavior', () => {
    it('should accept an operation and payload, and return an object', () => {
        expect(executeLambda('some-operation', {})).toBeInstanceOf(Object);
    });
});
