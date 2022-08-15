const { Prorater } = require('../lib/components/Prorater.js');

function getProrationResult(data)
{
    return (new Prorater(data)).getProratedAmounts();
}

exports.getProrationResult = getProrationResult;