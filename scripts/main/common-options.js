/**
 * Options common across multiple plugins
 * moneyUnitName: 'cents', 'whole', 'mills', 'tenths', 'tens'
 */
const options = {
    moneyUnitName: 'cents'
};

switch (options.moneyUnitName)
{
    case 'whole':
        options.roundMoney = ((amt) => Math.round(amt));
        options.moneyUnit = 1;
        break;
    case 'tenths':
        options.roundMoney = ((amt) => (Math.round(amt * 10) / 10));
        options.moneyUnit = 0.1;
        break;
    case 'mills':
        options.roundMoney = ((amt) => (Math.round(amt * 1000) / 1000));
        options.moneyUnit = 0.001;
        break;
    case 'tens':
        options.roundMoney = ((amt) => (Math.round(amt / 10) * 10));
        options.moneyUnit = 10;
        break;
    default:
        options.roundMoney = ((amt) => (Math.round(amt * 100) / 100));
        options.moneyUnit = 0.01;
        break;
}

module.exports = {
    options
};
