const { createInstallments } = require('../../../scripts/wrappers/full-pay-to-monthly-with-credit/installments.js');
const { getFullPayToMonthlyEndorsement1 } = require('../../sample-data/paymentScheduleSampleData.js').validSamples;

describe('full pay to monthly wrapper', () => {
    it('should return expected values', () => {
        const { installments }= createInstallments(getFullPayToMonthlyEndorsement1());
        expect(installments).toHaveLength(8);
        installments.forEach((installment, idx) => {
            if (idx === 0) {
                expect(installment.invoiceItems).toHaveLength(1);
            } else {
                expect(installment.invoiceItems.length).toBeGreaterThan(1);
            }
        });
    });
});