const { InstallmentsGenerator } = require('../lib/components/InstallmentsGenerator.js');
const { determineInstallmentGeneratorOptions } = require('../lib/utils/utils.js');

function createInstallments(data)
{
    return (new InstallmentsGenerator(data, determineInstallmentGeneratorOptions(data))).getInstallments();
}

module.exports = {
    createInstallments
}
