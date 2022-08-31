const { PostIssuanceConsolidator } = require('../../../scripts/lib/components/PostIssuanceConsolidator');
const { getPostIssuanceData1 } = require('../../sample-data/postIssuanceSampleData.js');

describe('Post-issuance', () => {
    it('Should return consolidated document result in accordance with options', () => {
        const result = (new PostIssuanceConsolidator(getPostIssuanceData1())).getPostIssuanceResult();
        expect(result.documentConsolidations).toHaveLength(1);
        const doc = result.documentConsolidations[0];
        expect(doc.displayName).toEqual("Consolidated Document");
        expect(doc.documentLocators).toHaveLength(4);
        expect(doc.fileName).toEqual("consolidated.pdf");
        expect(doc.deleteSourceDocuments).toEqual(true);
    });
});