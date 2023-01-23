const { createMockApi } = require('./test-helpers.js');

createMockApi({
    tableInfo: [{
        tableName: "myTable",
        tableData: "key,value\nmyTableValue,good"
    }]
})

describe('augmented underwriter', () => {
    it('should work', () => {
        expect(getUnderwritingResult().decision).toBe('accept');
    });
});


/**
 * Normally we'd import a component like this for testing.
 */
function getUnderwritingResult(data)
{
    const tableVal = socotraApi.tableLookup(0, 'myTable', 'myTableValue');

    return {
        'decision': tableVal == 'good' ? 'accept' : 'reject',
        'notes': []
    }
}
