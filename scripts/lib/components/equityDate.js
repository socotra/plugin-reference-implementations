const { getActivePerilChars } = require('../utils/utils.js');

/**
 * Given an array of peril characteristic objects with start and end coverage timestamps,
 * return a flat list of deduplicated timestamps (no distinction for start/end)
 * @param perilChars
 * @returns {*[]}
 */
function getOrderedTimestamps(perilChars) {
    return [...new Set(
        perilChars.flatMap(pc => [pc.coverageStartTimestamp,
            pc.coverageEndTimestamp]))].sort();
}

/**
 * Given an array of peril characteristic objects, return an ordered list of segments,
 * where a 'segment' is a slice of time demarcated by intersecting start/end timestamps
 * across the length of (earliest startTimestamp in peril char set) and
 * (latest endTimestamp in peril char set)
 * @param perilChars
 * @returns {*[]}
 */
function getEmptySegments(perilChars) {
    const ordered = getOrderedTimestamps(perilChars);
    let segments = []
    for (let i = 0; i < ordered.length - 1; i++) {
        segments.push({
            start: ordered[i],
            end: ordered[i+1],
            amount: 0
        });
    }
    return segments;
}

/**
 * Given a set of peril characteristics objects, assign prorated values
 * to each segment of time
 * @param perilChars
 * @returns {*[]}
 */
function getPerilSegments(perilChars) {
    let segments = getEmptySegments(perilChars);
    for (let pc of perilChars) {
        const pcStart = pc.coverageStartTimestamp;
        const pcEnd = pc.coverageEndTimestamp;
        const perilDuration = pcEnd - pcStart;
        for (let segment of segments) {
            const segmentDuration = segment.end - segment.start;
            if (pcStart <= segment.start && pcEnd >= segment.end) {
                const ratio = segmentDuration / perilDuration;
                segment.amount += (ratio * pc.premium);
            }
        }
    }

    return segments;
}

/**
 * Given a policy locator and a (paid) amount, determine the end date (timestamp)
 * after which the amount no longer covers the value of the policy.
 *
 * A message is returned to provide further information in anomalous cases.
 * @param policyLocator
 * @param amount
 * @returns {{equityDate: number, message: string}}
 */
function getEquityDate(policyLocator, amount) {
    const policyResponse = socotraApi.fetchByLocator(Policy, policyLocator);
    const perilSegments = getPerilSegments(getActivePerilChars(policyResponse));

    let equityDate = 0;
    let message = '';

    if (amount < 0) {
        return {
            equityDate,
            message: 'Paid amount must be nonnegative.'
        }
    }

    let remainingAmount = amount;
    for (segment of perilSegments) {
        const segmentAmount = segment.amount;
        // If we can afford the whole segment,
        // consume it and move to the next segment
        if (remainingAmount > segmentAmount) {
            remainingAmount -= segmentAmount;
            continue;
        }

        // If the remaining amount is equal to or < segment amount,
        // the equity date is in the segment. First check for exact match; else we
        // need to calc proportion
        if (remainingAmount == segmentAmount) {
            equityDate = segment.end;
            remainingAmount -= segmentAmount;
            break;
        }

        // Determine how much of the segment we can afford
        const proportion = remainingAmount / segmentAmount;
        equityDate = parseInt(segment.start + (proportion * (segment.end - segment.start)));
        remainingAmount -= segmentAmount;
        break;
    }

    if (remainingAmount > 0) {
        return {
            equityDate: 0,
            message: 'Paid amount exceeds policy value.'
        }
    }

    return {
        equityDate,
        message
    };
}

module.exports = {
    getEquityDate
}