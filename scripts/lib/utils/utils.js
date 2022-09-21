function durationCalcMethod(paymentScheduleName) {
    return paymentScheduleName === 'weekly' ? 'wholeDays' : 'months';
}

/**
 * Return a list of active peril characteristics for a policy, where each entry
 * has key premium, start/end, and peril/exposure name and locator
 */
function getActivePerilChars(policyResponse) {
    let results = [];

    for (const exposure of policyResponse.exposures) {
        const exposureLocator = exposure.locator;
        const exposureName = exposure.name;
        for (const peril of exposure.perils) {
            const perilLocator = peril.locator;
            const perilName = peril.name;
            for (const characteristic of peril.characteristics) {
                if (characteristic.replacedTimestamp) continue;
                results.push({
                    exposureLocator,
                    exposureName,
                    perilLocator,
                    perilName,
                    premium: parseFloat(characteristic.premium),
                    coverageStartTimestamp: parseInt(characteristic.coverageStartTimestamp),
                    coverageEndTimestamp: parseInt(characteristic.coverageEndTimestamp)
                });
            }
        }
    }

    return results;
}

module.exports = {
    durationCalcMethod,
    getActivePerilChars
}