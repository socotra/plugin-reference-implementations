const { PostPaymentReversalGraceAdjuster } = require('../lib/components/PostPaymentReversalGraceAdjuster.js');

function getPostPaymentReversal(data)
{
    return (new PostPaymentReversalGraceAdjuster(data)).getReversalResponse();
}
exports.getPostPaymentReversal = getPostPaymentReversal;