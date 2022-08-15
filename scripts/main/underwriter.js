const { Underwriter } = require('../lib/components/Underwriter.js');

function getUnderwritingResult(data)
{
    return (new Underwriter(data)).getUnderwritingResults();
}

exports.getUnderwritingResult = getUnderwritingResult;