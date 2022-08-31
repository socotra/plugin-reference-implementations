const { Underwriter } = require ('../../../scripts/lib/components/Underwriter.js');

const sampleData = require('../../sample-data/underwritingSampleData.js');

describe('underwriting results on new business', () => {
    it('should return an "accept" decision and notes for acceptable new business', () => {
        const data = sampleData.getNewBusinessData();
        const result = (new Underwriter(data)).getUnderwritingResults();

        expect(result.decision).toBe("accept");
        expect(result.notes).toHaveLength(0);
    });
});

describe('underwriting results on endorsement', () => {
    it('should have an "accept" decision and notes for acceptable endorsement', () => {
        const data = sampleData.getEndorsementData();
        const result = (new Underwriter(data)).getUnderwritingResults();

        expect(result.decision).toBe("accept");
        expect(result.notes).toHaveLength(0);
    });
});

describe('subclass works as expected', () => {
    class CustomUnderwriter extends Underwriter {
        getDecisionAndNotesForPerilChars(perilCharacteristics) {
            return {
                decision: 'reject',
                notes: ['found a bad peril']
            }
        }

        getDecisionAndNotesForExposureChars(exposureCharacteristics) {
            return {
                decision: 'accept',
                notes: ['exposures look great']
            }
        }
    }

    it('should return expected results', () => {
        const data = sampleData.getNewBusinessData();
        const result = (new CustomUnderwriter(data)).getUnderwritingResults();
        expect(result.decision).toEqual('reject');
        expect(result.notes).toEqual(['exposures look great', 'found a bad peril']);
    });
});