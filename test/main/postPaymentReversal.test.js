// TODO - tests with a sample case
//   1. case where within grace period
//   2. case where past grace period and will instead lapse tonight

const { getPostPaymentReversal } = require('../../scripts/main/postPaymentReversal.js');
const { midnightTonightForReversalData } = require('../test-helpers.js');

const { getPaymentReversalOutsideGrace,
        getPaymentReversalWithinGrace } = require('../sample-data/paymentReversalSampleData.js');

describe('Payment reversal plugin', () => {
    test('case within grace period returns expected value', () => {
        const data = getPaymentReversalWithinGrace();
        const midnightTonight = midnightTonightForReversalData(data);
        const res = getPostPaymentReversal(data);
        expect(res.gracePeriodEndTimestamp).toBeGreaterThan(midnightTonight);
    });

    test('case outside grace period returns midnight tonight', () => {
        const data = getPaymentReversalOutsideGrace();
        const midnightTonight = midnightTonightForReversalData(data);
        const res = getPostPaymentReversal(data);
        expect(res.gracePeriodEndTimestamp).toEqual(midnightTonight);
    });
});