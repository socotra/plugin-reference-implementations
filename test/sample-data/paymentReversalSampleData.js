const path = require('path');
const { jsonFromFile, midnightTonightForReversalData } = require('../test-helpers.js');
const { DateCalc } = require('../../scripts/lib/utils/DateCalc.js');

const f = (fileName) => path.resolve(__dirname, './type-samples/PaymentReversalPluginData/', fileName);

const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;

/**
 * Return copy of template data where (invoice due + grace period) is later than midnight tonight
 */
function getPaymentReversalWithinGrace() {
    let paymentReversalData = jsonFromFile(f('PaymentReversal1.json'))
    const midnightTonight = midnightTonightForReversalData(paymentReversalData);
    paymentReversalData.invoiceDueTimestamp = midnightTonight + (7 * ONE_DAY_MILLIS);
    return paymentReversalData;
}

module.exports = {
    getPaymentReversalOutsideGrace: () => jsonFromFile(f('PaymentReversal1.json')),
    getPaymentReversalWithinGrace
};
