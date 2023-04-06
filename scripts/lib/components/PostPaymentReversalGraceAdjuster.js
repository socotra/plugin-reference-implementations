/**
 * A sample implementation of the post-payment reversal plugin.
 */
const { DateCalc } = require('../utils/DateCalc.js');

const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;

class PostPaymentReversalGraceAdjuster {
    VERSION = '1.6';

    constructor(data) {
        this.data = data;
        this.dateCalc = new DateCalc(data.tenantTimezone);
    }

    getReversalResponse() {
        const data = this.data;
        let ret = {};

        const midnightTonight = this.dateCalc.getEndOfDayTimestamp(new Date().getTime());

        if (data.operationType === 'payment_reversal' && data.invoiceAmount > 0) {
            ret.gracePeriodEndTimestamp =
                Math.max(midnightTonight,
                    parseInt(data.invoiceDueTimestamp) + data.gracePeriodDays * ONE_DAY_MILLIS);
        }
        return ret;
    }
}

module.exports = {
    PostPaymentReversalGraceAdjuster
}
