/**
 * Simple prorater plugin using basic duration ratios to determine amounts. Override getProratedAmounts
 * in a custom implementation.
 */
const { DateCalc } = require('../utils/DateCalc.js');
const { roundMoney } = require('../../main/common-options.js').options;
const { durationCalcMethod } = require('../utils/utils.js');

class Prorater {
    VERSION = '1.0';

    constructor(data) {
        this.data = data;
    }

    getProratedAmounts() {
        let data = this.data;
        this.#destringifyProrationData();

        const policyStartTimestamp = parseInt(data.policy.originalContractStartTimestamp) ||
            this.#fallbackGetEarliest(data.items);

        const dateCalc = new DateCalc(data.tenantTimeZone,
            policyStartTimestamp,
            durationCalcMethod(data.paymentScheduleName));

        return { items: data.items.map(item => ({ id: item.id,
                proratedAmount: roundMoney(dateCalc.getDurationRatio(item.segmentStartTimestamp,
                    data.segmentSplitTimestamp,
                    item.segmentEndTimestamp) * item.amount),
                holdbackAmount: 0 })) };
    }

    #fallbackGetEarliest(items)
    {
        let x = 9999999999999; // Far future date
        for (const i of items)
            x = Math.min(x, i.segmentStartTimestamp);
        return x;
    }

    #destringifyProrationData() {
        let data = this.data;
        data.segmentSplitTimestamp = parseInt(data.segmentSplitTimestamp);
        for (const item of data.items)
        {
            item.amount = parseFloat(item.amount);
            item.followingAmount = parseFloat(item.followingAmount);
            item.segmentStartTimestamp = parseInt(item.segmentStartTimestamp);
            item.segmentEndTimestamp = parseInt(item.segmentEndTimestamp);
        }
    }
}

module.exports = {
    Prorater
}