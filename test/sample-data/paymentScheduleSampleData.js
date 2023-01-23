const path = require('path');
const { jsonFromFile } = require('../test-helpers.js');

const f = (fileName) => path.resolve(__dirname, './type-samples/PaymentSchedulePluginData/', fileName);

module.exports = {
    validSamples: {
        getNewBusiness1: () => jsonFromFile(f('NewBusiness1.json')),
        getNewBusiness2: () => jsonFromFile(f('NewBusiness2.json')),
        getNewBusiness3: () => jsonFromFile(f('NewBusiness3.json')),
        getNewBusiness4: () => jsonFromFile(f('NewBusiness4.json')),
        getNewBusiness5: () => jsonFromFile(f('NewBusiness5.json')),
        getNewBusiness6: () => jsonFromFile(f('NewBusiness6.json')),
        getNewBusiness7: () => jsonFromFile(f('NewBusiness7.json')),
        getNewBusiness8: () => jsonFromFile(f('NewBusiness8.json')),
        getNewBusiness9: () => jsonFromFile(f('NewBusiness9.json')),
        getEndorsement1: () => jsonFromFile(f('Endorsement1.json')),
        getEndorsement2: () => jsonFromFile(f('Endorsement2.json')),
        getEndorsement3: () => jsonFromFile(f('Endorsement3.json')),
        getEndorsement4: () => jsonFromFile(f('Endorsement4.json')),
        getEndorsement5: () => jsonFromFile(f('Endorsement5.json')),
        getEndorsement6: () => jsonFromFile(f('Endorsement6.json')),
        getEndorsement7: () => jsonFromFile(f('Endorsement7.json')),
        getRenewal1: () => jsonFromFile(f('Renewal1.json')),
        getEndorsementAfterRenewal1: () => jsonFromFile(f('EndorsementAfterRenewal1.json')),
        getEndorsementAfterRenewal2: () => jsonFromFile(f('EndorsementAfterRenewal2.json')),
        getCancel2: () => jsonFromFile(f('Cancel2.json')),
        getCancelReinstate1: () => jsonFromFile(f('CancelReinstate1.json')),
        getCancelReinstate2: () => jsonFromFile(f('CancelReinstate2.json')),
        getCancelReinstate3: () => jsonFromFile(f('CancelReinstate3.json')),
        getCancelReinstateWithGap1: () => jsonFromFile(f('CancelReinstateWithGap1.json')),
        getCancelReinstateWithGap2: () => jsonFromFile(f('CancelReinstateWithGap2.json')),
        getCancelReinstateWithGap3: () => jsonFromFile(f('CancelReinstateWithGap3.json')),
        getFullPayToMonthlyEndorsement1: () => jsonFromFile(f('FullPayToMonthlyEndorsement1.json')),
        getFullPayToMonthlyEndorsement2: () => jsonFromFile(f('FullPayToMonthlyEndorsement2.json')),
        getCancellation1: () => jsonFromFile(f('Cancel1.json')),
        getReinstate1: () => jsonFromFile(f('Reinstate1.json')),
        getReinstate2: () => jsonFromFile(f('Reinstate2.json')),
        getRefund1: () => jsonFromFile(f('Refund1.json')),
        getWholeDollarEndorsement1: () => jsonFromFile(f('WholeDollarEndorsement1.json')),
        getLiteChargeSet1: () => jsonFromFile(f('LiteChargeSet1.json')),
    },
    invalidSamples: {
        getUnrecognizedScheduleChange: () => jsonFromFile(f('UnrecognizedScheduleChange.json'))
    },
    specialCaseSamples: {
        getNoOpPaymentScheduleChange: () => jsonFromFile(f('NoOpPaymentScheduleChange.json'))
    }
};
