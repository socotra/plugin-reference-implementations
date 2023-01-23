const { createInstallments } = require('../../../scripts/wrappers/partial-payment/installments.js');
const { getNoOpPaymentScheduleChange } = require('../../sample-data/paymentScheduleSampleData.js').specialCaseSamples;
const { commonAssertions } = require('../../test-helpers.js');

const EPSILON = 0.000001;
const TARGET_INVOICE_LOCATOR = '0bffe358-eb80-4214-820e-c605b4ae4f11';

describe('partial payments implementation', () => {
    describe.each(['30.00', '10000.00'])('client paid %i', (clientPaidAmount) => {
        global.socotraApi = {
            getAuxData: function() {
                return JSON.stringify({
                    paymentAmount: clientPaidAmount,
                    targetInvoiceLocator: TARGET_INVOICE_LOCATOR,
                    expires: 9999793584863
                });
            },
            deleteAuxData: function() {}
        };

        const { installments } = createInstallments(getNoOpPaymentScheduleChange());
        const originalData = getNoOpPaymentScheduleChange();

        it('should have an initial installment with a single charge whose amount is the reverse' +
            ' of the mismatch invoice original amount', () => {
            const reversalInvoiceItems = installments[0].invoiceItems;
            const mismatchInvoiceAmount = originalData.policy.invoices.find(i => i.locator === TARGET_INVOICE_LOCATOR).totalDue;
            expect(reversalInvoiceItems).toHaveLength(1);
            expect(reversalInvoiceItems[0].amount + parseFloat(mismatchInvoiceAmount)).toBeLessThan(EPSILON);
        });

        it('should have a second installment with a charge for the amount the client actually paid', () => {
            const offsetChargeId = installments[0].invoiceItems[0].chargeId;
            const offsetChargeForClientAmount = installments[1].invoiceItems.filter(i => i.chargeId == offsetChargeId);
            expect(offsetChargeForClientAmount).toHaveLength(1);
            expect(offsetChargeForClientAmount[0].amount - parseFloat(clientPaidAmount)).toBeLessThan(EPSILON);
        });

        commonAssertions(originalData, installments);
    });
});
