/**
 * Sample rater implementation - override getRatedAmounts in your own implementation.
 */
require("../utils/arrays.js");
const { DateCalc } = require("../utils/DateCalc.js");
const { PolicyContext } = require("../utils/PolicyContext.js");
const { durationCalcMethod } = require('../utils/utils.js');
const { roundMoney } = require('../../main/common-options.js').options;

class Rater {
    VERSION = '1.1';

    constructor(data) {
        this.data = data;
    }

    getRatedAmounts() {
        let data = this.data;

        const dateCalc = new DateCalc(data.tenantTimeZone,
            parseInt(data.policy.originalContractStartTimestamp),
            durationCalcMethod(data.policy.paymentScheduleName));

        const context = this.preprocessContext(new PolicyContext(data.policy));
        const charsToRate = data.policyExposurePerils.map(
            pep => context.getPerilCharacteristics(pep.perilCharacteristicsLocator));

        const rates = {};

        let rateDurationFactor;
        switch (dateCalc.getDurationUnit()) {
            case 'months':
                rateDurationFactor = 1/12;
                break;
            case 'days360':
                rateDurationFactor = 1/360;
                break;
            case 'days365':
                rateDurationFactor = 1/365;
                break;
            case 'days':
            case 'wholeDays':
                rateDurationFactor = 1/365;
                break;
            case 'ms':
                rateDurationFactor = 1/(365 * 24 * 60 * 60 * 1000);
                break;
            default:
                throw `rater.js: Duration unit ${dateCalc.getDurationUnit()} not supported.`;
        }

        for (const ch of charsToRate) {
            // Iterate over characteristics, using peril, exposure, and policy data to set factors and perform calcs
            const peril = context.getPeril(ch.perilLocator);
            const expCh = context.getExposureCharacteristics(ch.exposureCharacteristicsLocator);
            const polCh = context.getPolicyCharacteristics(ch.policyCharacteristicsLocator);

            // Example factors and values
            let rate = 0.25;
            let multiplier = 1;
            let fixedRateAdj = 1;

            switch (peril.name) {
                // Update factors according to peril
            }

            rate *= multiplier;
            rate += fixedRateAdj;

            const commissions = [];

            const premium = roundMoney(
                rate * dateCalc.getDuration(ch.coverageStartTimestamp, ch.coverageEndTimestamp) * rateDurationFactor);

            rates[ch.locator] = {
                exactPremium: premium,
                yearlyPremium: rate,
                yearlyTechnicalPremium: rate * 0.8, // Sample scaling
                commissions: commissions
            };
        }

        return { pricedPerilCharacteristics: rates };
    }

    preprocessContext(context) {
        for (const perCh of context.allPerilCharacteristics()) {
            perCh.coverageStartTimestamp = parseInt(perCh.coverageStartTimestamp);
            perCh.coverageEndTimestamp = parseInt(perCh.coverageEndTimestamp);
        }
        return context;
    }
}

module.exports = {
    Rater
}