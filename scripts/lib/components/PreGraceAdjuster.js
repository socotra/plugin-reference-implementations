/**
 * Basic pre-grace adjustment sample: simply adds a set number of days
 * to current time, setting the result as the new grace period end timestamp
 * and the cancellation effective timestamp as midnight of the new grace period end timestamp.
 *
 * You can adopt this plugin as-is and set the options on instantiation if this
 * behavior suits your needs; else, you will need to override preGraceResult with more complex
 * logic.
 */
const { DateCalc } = require('../../lib/utils/DateCalc.js');

const DEFAULT_OPTIONS = {
    additionalDaysGrace: 10 // additional days beyond now
}

class PreGraceAdjuster {
    VERSION = '1.0';

    constructor(data, options = {}) {
        this.data = data;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    getPreGraceResult() {
        const nowTimestamp = new Date().getTime();
        const dateCalc = new DateCalc(this.data.tenantTimeZone);
        const newGraceEndTimestamp = dateCalc.addToTimestamp(nowTimestamp,
            this.options.additionalDaysGrace,
            'days');

        return {
            gracePeriodEndTimestamp: newGraceEndTimestamp,
            cancelEffectiveTimestamp: dateCalc.getEndOfDayTimestamp(newGraceEndTimestamp)
        };
    }
}

module.exports = {
    PreGraceAdjuster
}