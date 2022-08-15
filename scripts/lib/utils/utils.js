module.exports = {
    durationCalcMethod: (paymentScheduleName) => (paymentScheduleName === 'weekly' ? 'wholeDays' : 'months')
}