const { getDataAutofill } = require('../../scripts/main/dataAutofill.js');

describe('Auto-fill plugin', () => {
    it('should respond with an update request object', () => {
        expect(getDataAutofill({ operation: 'newBusiness' })).toEqual({});
    });
});