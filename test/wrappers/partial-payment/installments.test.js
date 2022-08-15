const { createInstallments } = require('../../../scripts/wrappers/partial-payment/installments.js');
const { getNoOpPaymentScheduleChange } = require('../../sample-data/paymentScheduleSampleData.js').specialCaseSamples;
const { commonAssertions } = require('../../test-helpers.js');

// testing mock
global.socotraApi = {
    getAuxData: function() {
        return JSON.stringify({
            paymentAmount: '150.00',
            targetInvoiceLocator: '0bffe358-eb80-4214-820e-c605b4ae4f11',
            expires: 9999793584863
        });
    },
    deleteAuxData: function() {}
};

describe('partial payments implementation', () => {
    const { installments } = createInstallments(getNoOpPaymentScheduleChange());
    const originalData = getNoOpPaymentScheduleChange();

    it('should return expected values', () => {
        const { installments }= createInstallments(getNoOpPaymentScheduleChange());
        expect(installments).toHaveLength(3);
        expect(installments[0].invoiceItems).toHaveLength(1);
        expect(installments[0].invoiceItems[0].chargeId).toEqual('2_premium_db52d335-1181-4e17-8c1e-e1dd12adf48f');
        expect(installments[1].invoiceItems).toHaveLength(1);
        expect(installments[1].invoiceItems[0].chargeId).toEqual('2_premium_db52d335-1181-4e17-8c1e-e1dd12adf48f');
        expect(installments[2].invoiceItems).toHaveLength(4);
    });

    commonAssertions(originalData, installments);
});