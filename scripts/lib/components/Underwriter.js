/**
 * Sample underwriter plugin. Override getUnderwritingResults for your own implementation.
 */
require("../utils/arrays.js");
const { PolicyContext } = require("../utils/PolicyContext.js");

class Underwriter {
    VERSION = '1.0';

    constructor(data) {
        this.data = data;
    }

    getUnderwritingResults() {
        let data = this.data;
        const context = new PolicyContext(data.policy);

        let decision = 'accept';
        let notes = [];

        /**
         * Pattern: base decisions on any relevant data at policy, exposure, peril level
         */
        // Policy
        const policy = context.getPolicy();
        const policyResults = this.getDecisionAndNotesForPolicyChars(
                                    this.#getUnreplaced(policy.characteristics));

        // Exposures
        const expResults = this.getDecisionAndNotesForExposureChars(
                                    this.#getUnreplaced(context.allExposureCharacteristics()));

        // Perils
        const perilResults = this.getDecisionAndNotesForPerilChars(
            this.#getUnreplaced(context.allPerilCharacteristics()));

        const decisions = [policyResults, expResults, perilResults].map(r => r.decision);
        if (decisions.includes('none')) {
            decision = 'none';
        }

        if (decisions.includes('reject')) {
            decision = 'reject';
        }

        notes = [...policyResults.notes,
                 ...expResults.notes,
                 ...perilResults.notes];

        return { decision, notes };
    }

    /**
     * Return a decision and notes pertaining to policy characteristics.
     *
     * @param policyCharacteristics the set of unreplaced policy characteristics
     */
    getDecisionAndNotesForPolicyChars(policyCharacteristics) {
        let decision = 'accept';
        let notes = [];
        for (const policyCh of policyCharacteristics) {
            // Policy decisions and notes
        }

        return { decision, notes };
    }

    /**
     * Return a decision and notes pertaining to exposure characteristics
     * @param exposureCharacteristics the set of unreplaced exposure characteristics
     */
    getDecisionAndNotesForExposureChars(exposureCharacteristics) {
        let decision = 'accept';
        let notes = [];
        for (const exposureCh of exposureCharacteristics) {
            // Policy decisions and notes
        }

        return { decision, notes };
    }

    /**
     * Return a decision and notes pertaining to peril characteristics
     * @param perilCharacteristics the set of unreplaced peril characteristics
     */
    getDecisionAndNotesForPerilChars(perilCharacteristics) {
        let decision = 'accept';
        let notes = [];
        for (const perilCh of perilCharacteristics) {
            // Peril decisions and notes
        }

        return { decision, notes };
    }

    #getUnreplaced(chars) {
        return chars.filter(ch => !ch.replacedTimestamp);
    }
}

module.exports = {
    Underwriter
}
