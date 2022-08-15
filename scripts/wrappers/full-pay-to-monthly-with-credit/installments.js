require("../../lib/utils/arrays.js");
const standardPlugin = require("../../main/installments.js");

/**
 * In the event of a full pay situation that should be converted into installments
 * we need to create a credit invoice and spread the credit over the remainder of
 * the policy.
 *
 * For example, if a full pay policy for $1200 has been invoiced, two months later
 * we could create new installments of:
 * ($1200), $200, $100, $100 ... $100 = net zero
 * To choose this approach, set CREATE_FULL_CREDIT_INVOICE to true.
 *
 * Alternatively, you can choose to combine the credit invoice with the currently
 * payable amount, like this:
 * ($1000), $100, $100, ... $100 = net zero
 * To choose this alternative approach, set CREATE_FULL_CREDIT_INVOICE to false.
 *
 * The code triggers when the first invoice is less than 90 days old and the pay
 * plan changes from full-pay to installments, and an endorsement effective on the
 * policy start is created. This could be made more explicit by setting a flag in
 * aux data, or you could choose different trigger criteria. Use care to make sure
 * the logic is triggered *only* when you want it to.
*/

function createInstallments(data) {
    const FULL_PAY_SCHEDULE_NAME = 'upfront';
    const CREATE_FULL_CREDIT_INVOICE = true;
    const CHANGE_WINDOW_DURATION = 90 * 24 * 60 * 60 * 1000; /* 90 days */
    const now = new Date().valueOf();

    const FORCE_FOR_TESTING = true;
    
    // adjust as needed for business reqs
    const conditionsMet = data.oldPaymentScheduleName === FULL_PAY_SCHEDULE_NAME &&
                          data.paymentScheduleName !== FULL_PAY_SCHEDULE_NAME &&
                          data.operation === 'endorsement' &&
                          data.policy.originalContractStartTimestamp === data.policy.modifications.last().effectiveTimestamp &&
                          data.policy.invoices.length === 1 &&
                          now - data.policy.invoices[0].createdTimestamp < CHANGE_WINDOW_DURATION;

    if (!(conditionsMet || FORCE_FOR_TESTING)) {
        return standardPlugin.createInstallments(data);
    } else {
        return adjustForFullPayToMonthlyCredit(data, CREATE_FULL_CREDIT_INVOICE)
    }
}

function adjustForFullPayToMonthlyCredit(data, CREATE_FULL_CREDIT_INVOICE) {
    // Find a single charge which will be manipulated to create the overall invoice amounts desired
    const carrierCharge = data.charges.first(ch => ch.type === 'premium') ||
        data.charges.first(ch => ch.type !== 'commission');

    // If we didn't find one then we can't proceed
    if (!carrierCharge) {
        return standardPlugin.createInstallments(data);
    }

    const { DateCalc } = require('../../lib/utils/DateCalc.js');
    const { roundMoney } = require('../../main/common-options.js').options;
    const { durationCalcMethod } = require('../../lib/utils/utils.js');

    const transactionEffectiveTimestamp = data.policy.modifications.last().effectiveTimestamp;
    const creditsForBilledAmounts = [];
    const REVERSAL_SLUG = '<<reversal>>';

    for (const ch of data.charges) {
        ch.amount = parseFloat(ch.amount);
        ch.previouslyInvoicedAmount = parseFloat(ch.previouslyInvoicedAmount);
        ch.originalAmount = parseFloat(ch.originalAmount);
        // Gross up all charges to the full original amounts, and save
        // the difference in the creditsForBilledAmounts array.
        const chPrevAmt = ch.previouslyInvoicedAmount;
        if (chPrevAmt) {
            const chAmount = ch.amount;
            ch.amount = chAmount + chPrevAmt;
            ch.previouslyInvoicedAmount = 0;
            ch.originalAmount = ch.amount;
            creditsForBilledAmounts.push({chargeId: ch.chargeId, amount: -chPrevAmt});
        }
    }

    data.charges = data.charges.filter(ch => ch.amount);

    // It may be that there are billed amounts that don't show up on any charge
    // because they are fully billed and filtered before they come to the plugin.
    // Therefore the totalCredits may be less than the actual credit we want to
    // create, so we'll do this:
    // * Create a positive charge for the difference and spread it over installments
    // * Put a new invice item with the opposite amount on the first installment (a
    //   credit) such that the net amount for this synthetic charge is zero.
    const dateCalc = new DateCalc(data.tenantTimeZone,
        parseInt(data.policy.originalContractStartTimestamp),
        durationCalcMethod(data.paymentScheduleName));
    const billedAmt = data.policy.invoices.sum(i => parseFloat(i.totalDue));
    const totalCredits = creditsForBilledAmounts.sum(x => x.amount);
    const remainderCredit = billedAmt + totalCredits; /* total credits is non-positive, usually */
    const netCreditAmt = transactionEffectiveTimestamp > data.policy.originalContractStartTimestamp
        ? roundMoney(remainderCredit *
            dateCalc.getDurationRatio(data.policy.originalContractStartTimestamp,
                transactionEffectiveTimestamp,
                data.policy.effectiveContractEndTimestamp,
                true))
        : remainderCredit;

    if (netCreditAmt) {
        data.charges.push({
            coverageStartTimestamp: transactionEffectiveTimestamp,
            coverageEndTimestamp: data.policy.effectiveContractEndTimestamp,
            chargeId: REVERSAL_SLUG,
            amount: netCreditAmt,
            originalAmount: netCreditAmt,
            previouslyInvoicedAmount: 0,
            isNew: true,
            category: 'new'
        });

        // Run the normal installments algorithm
        const response = standardPlugin.createInstallments(data);
        for (const ii of response.installments.flatMap(i => i.invoiceItems))
            if (ii.chargeId === REVERSAL_SLUG)
                ii.chargeId = carrierCharge.chargeId;


        const firstInst = response.installments[0];

        if (CREATE_FULL_CREDIT_INVOICE && firstInst.invoiceItems.length) {
            // Create a new credit installment and put it before the first scheduled
            // installment by dividing that first time period in half
            const newInst = {
                startTimestamp: firstInst.startTimestamp,
                endTimestamp: Math.round(firstInst.startTimestamp +
                    (firstInst.endTimestamp - firstInst.startTimestamp) / 2),
                dueTimestamp: firstInst.dueTimestamp,
                issueTimestamp: firstInst.issueTimestamp,
                writeOff: false,
                installmentFees: [],
                invoiceItems: [{chargeId: carrierCharge.chargeId, amount: -netCreditAmt},
                    ...creditsForBilledAmounts]
            };
            firstInst.startTimestamp = newInst.endTimestamp;
            response.installments = [newInst, ...response.installments];
        } else {
            // Combine the credits with the first installment
            firstInst.invoiceItems = [...firstInst.invoiceItems,
                ...creditsForBilledAmounts,
                {chargeId: carrierCharge.chargeId, amount: -netCreditAmt}];
        }

        // Consolidate and simplify
        for (const inst of response.installments) {
            // combine invoice items with the same chargeId
            const g = Array.from(inst.invoiceItems.groupBy(ii => ii.chargeId, ii => ii).values());
            inst.invoiceItems = g.map(gg => gg.length === 1 ? gg[0] : {
                chargeId: gg[0].chargeId,
                amount: gg.sum(x => x.amount)
            });
        }
        return response;
    }
}

exports.createInstallments = createInstallments;
