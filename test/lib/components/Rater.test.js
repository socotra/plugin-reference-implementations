const path = require('path');
const jsonFromFile = require('../../test-helpers.js').jsonFromFile;
const { Rater } = require('../../../scripts/lib/components/Rater.js');
const sampleData = require('../../sample-data/ratingSampleData.js');
const f = (fileName) => path.resolve(__dirname, fileName);

describe('rating results on endorsement', () => {
    it('should return the right response for endorsement test #1', () => {
        const result = (new Rater(sampleData.getEndorsementData1())).getRatedAmounts();
        const expectedOutput = jsonFromFile(f('../../sample-data/expected-outputs/rating/endorsement1-rating.json'));
        expect(result).toEqual(expectedOutput);
    });

    it('should return the right response for endorsement test #2', () => {
        const result = (new Rater(sampleData.getEndorsementData2())).getRatedAmounts();
        const expectedOutput = jsonFromFile(f('../../sample-data/expected-outputs/rating/endorsement2-rating.json'));
        expect(result).toEqual(expectedOutput);
    });
});

describe('rating results on new business', () => {
    it('should return the right response for new business test #1', () => {
        const result = (new Rater(sampleData.getNewBusinessData1())).getRatedAmounts();
        const expectedOutput = jsonFromFile(f('../../sample-data/expected-outputs/rating/newbusiness1-rating.json'));
        expect(result).toEqual(expectedOutput);
    });

    it('should return the right response for new business test #2', () => {
        const result = (new Rater(sampleData.getNewBusinessData2())).getRatedAmounts();
        const expectedOutput = jsonFromFile(f('../../sample-data/expected-outputs/rating/newbusiness2-rating.json'));
        expect(result).toEqual(expectedOutput);
    });
});

