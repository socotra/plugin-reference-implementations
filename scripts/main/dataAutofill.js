const { Autofiller } = require('../lib/components/Autofiller.js')

function getDataAutofill(data) {
    return (new Autofiller(data)).getDataAutofill();
}

module.exports = {
    getDataAutofill
}