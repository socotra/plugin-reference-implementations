const { PostIssuanceConsolidator } = require('../lib/components/PostIssuanceConsolidator.js');


function getPostIssuanceResult(data)
{
    return (new PostIssuanceConsolidator(data)).getPostIssuanceResult();
}

module.exports = {
    getPostIssuanceResult
}