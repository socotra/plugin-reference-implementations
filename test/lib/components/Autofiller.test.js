const { Autofiller } = require('../../../scripts/lib/components/Autofiller.js');

describe('Auto-fill plugin', () => {
    it('should respond with an update request object', () => {
        expect((new Autofiller({ operation: 'newBusiness' })).getDataAutofill()).toEqual({});
    });
});