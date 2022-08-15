const { Rater } = require('../lib/components/Rater.js');

function getPerilRates(data)
{
    return (new Rater(data)).getRatedAmounts();
}

exports.getPerilRates = getPerilRates;