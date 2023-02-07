/**
 * This function is for determining the generator options.
 *
 * It will get installments plugin data as an argument.
 *
 * This function can be updatable with different business logic by looking up the `data`
 * and can return different options according to that logic.
 *
 * By default, it returns an empty object and doesn't change the default options.
 */
const determineInstallmentGeneratorOptions = (data) => {
  return {};
};

module.exports = {
  determineInstallmentGeneratorOptions,
  durationCalcMethod: (paymentScheduleName) => (paymentScheduleName === 'weekly' ? 'wholeDays' : 'months')
}