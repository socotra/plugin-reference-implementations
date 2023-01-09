const { InstallmentsGenerator } = require('../lib/components/InstallmentsGenerator.js');

function createInstallments(data)
{
    return (new InstallmentsGenerator(data, {firstInstallmentWeight: 0.2})).getInstallments();
}

module.exports = {
    createInstallments
}
