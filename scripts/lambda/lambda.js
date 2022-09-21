const { getEquityDate } = require('../lib/components/equityDate.js');

function executeLambda(operation, payload) {
    switch(operation) {
        case 'getEquityDate':
            return getEquityDate(payload.policyLocator, payload.amount);
        default:
            return {};
    }
}

module.exports = {
    executeLambda
}