const { PreGraceAdjuster } = require('../../../scripts/lib/components/PreGraceAdjuster.js');
const { getPreGraceData1 } = require('../../sample-data/preGraceSampleData.js');

describe('Pre-grace result', () => {
    it('Should return adjusted grace expiry and cancellation effectiveness past now', () => {
        const result = (new PreGraceAdjuster(getPreGraceData1())).getPreGraceResult();
        const nowTimestamp = new Date().getTime();
        expect(result.gracePeriodEndTimestamp).toBeGreaterThan(nowTimestamp);
        expect(result.cancelEffectiveTimestamp).toBeGreaterThan(result.gracePeriodEndTimestamp);
    });
});