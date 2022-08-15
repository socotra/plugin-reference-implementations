const { InstallmentsGenerator } = require('../lib/components/InstallmentsGenerator.js');

function createInstallments(data)
{
    return (new InstallmentsGenerator(data)).getInstallments();
}

module.exports = {
    createInstallments
}
