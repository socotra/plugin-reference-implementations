const { PostPaymentReversalGraceAdjuster } = require('../../../scripts/lib/components/PostPaymentReversalGraceAdjuster');
const { midnightTonightForReversalData } = require('../../test-helpers.js');

const { getPaymentReversalOutsideGrace,
    getPaymentReversalWithinGrace } = require('../../sample-data/paymentReversalSampleData.js');

describe('Payment reversal plugin', () => {
    test('case within grace period returns expected value', () => {
        const data = getPaymentReversalWithinGrace();
        const midnightTonight = midnightTonightForReversalData(data);
        const res = (new PostPaymentReversalGraceAdjuster(data)).getReversalResponse();
        expect(res.gracePeriodEndTimestamp).toBeGreaterThan(midnightTonight);
    });

    test('case outside grace period returns midnight tonight', () => {
        const data = getPaymentReversalOutsideGrace();
        const midnightTonight = midnightTonightForReversalData(data);
        const res = (new PostPaymentReversalGraceAdjuster(data)).getReversalResponse();
        expect(res.gracePeriodEndTimestamp).toEqual(midnightTonight);
    });
});