const { PreGraceAdjuster } = require('../lib/components/PreGraceAdjuster.js');

function getPreGraceResult(data) {
    return (new PreGraceAdjuster(data)).getPreGraceResult();
}

module.exports = {
    getPreGraceResult
}