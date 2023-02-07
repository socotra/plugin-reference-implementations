require("../../lib/utils/arrays.js");
const { InstallmentsGenerator }= require("../../lib/components/InstallmentsGenerator.js");
const { determineInstallmentGeneratorOptions } = require("../../lib/utils/utils.js");

/**
 * Implements ability to handle partial payments, with dependency on aux data
 * "partialPaymentInfo" with at least these properties:
 *      1. `targetInvoiceLocator`
 *      2. `paymentAmount`
 *      3. `totalDue`
 *      4. `invoiceCreatedTimestamp`
 *
 *  An optional property `applyOverpayCredit`, when provided and set to `true`, will result in negative remainder
 *  amounts being applied to subsequent installments until the remainder is exhausted.
 */
function createInstallments(data) {
    const generator = new InstallmentsGenerator(data, determineInstallmentGeneratorOptions(data));
    const { installments } = generator.getInstallments();

    const partialPaymentInfo = socotraApi.getAuxData(data.policy.locator, 'partialPaymentInfo');

    if (partialPaymentInfo) {
        return { installments: adjustForPartialPayments(data, installments, partialPaymentInfo) };
    } else {
        return { installments };
    }
}

function adjustForPartialPayments(data, installments, partialPaymentInfo) {
    const now = new Date().getTime();

    partialPaymentInfo = JSON.parse(partialPaymentInfo);

    if (now > parseInt(partialPaymentInfo.expires)) {
        socotraApi.deleteAuxData(data.policy.locator, 'partialPaymentInfo');
        return installments;
    }

    const mismatchedInvoice = data.policy.invoices.find(i => i.locator === partialPaymentInfo.targetInvoiceLocator);

    if (mismatchedInvoice) {
        let offsetCharge = data.charges.find(c => c.type === 'premium') ||
                           data.charges.find(c => c.type === 'fee' || c.type === 'tax');

        if (offsetCharge) {
            // We don't want overlaps in our installments, so we'll look at the invoice being reversed, and create
            // two installments in its time span, equal lengths. These are to (1) fully offset the mismatched
            // invoice and to (2) create an installment for the actual payment amount.
            const reversalAmount = -mismatchedInvoice.totalDue;
            const paymentAmount = parseFloat(partialPaymentInfo.paymentAmount);
            const remainder = -(reversalAmount + paymentAmount);

            const startTime = parseInt(mismatchedInvoice.startTimestamp);
            const endTime = parseInt(mismatchedInvoice.endTimestamp);
            const midTime = Math.round((endTime - startTime) / 2 + startTime)
            const reversalInstallment = {
                startTimestamp: startTime,
                endTimestamp: midTime,
                issueTimestamp: now - 100000,
                dueTimestamp: now + 24 * 60 * 60 * 1000, /* tomorrow */
                installmentFees: [],
                writeOff: false
            };
            const newInstallment = {
                startTimestamp: midTime,
                endTimestamp: endTime,
                issueTimestamp: reversalInstallment.issueTimestamp,
                dueTimestamp: reversalInstallment.dueTimestamp,
                installmentFees: [],
                writeOff: false
            };
            reversalInstallment.invoiceItems = [ {
                chargeId: offsetCharge.chargeId,
                amount: reversalAmount
            }];
            newInstallment.invoiceItems = [ {
                chargeId: offsetCharge.chargeId,
                amount: paymentAmount
            }];

            // If the new installments overlap with any calculated installments, merge them
            const overlapItems = installments.filter(i => i.startTime <= endTime && i.endTime >= startTime)
                                             .flatMap(i => i.invoiceItems);
            if (overlapItems.length) {
                newInstallment.invoiceItems = [...newInstallment.invoiceItems, ...overlapItems];
                installments.remove(i => i => i.startTime <= endTime && i.endTime >= startTime);
            }

            if (remainder < 0 && partialPaymentInfo.applyOverpayCredit) {
                let remainderDistrib = remainder;
                for (let installment of installments) {
                    const installTotalDue = installment.invoiceItems.map(i => i.amount).sum();
                    if (installTotalDue <= 0) continue;
                    if (Math.abs(remainderDistrib) >= installTotalDue) {
                        installment.invoiceItems.push({
                            chargeId: offsetCharge.chargeId,
                            amount: -installTotalDue
                        });
                        remainderDistrib += installTotalDue;
                    } else {
                        installment.invoiceItems.push({
                            chargeId: offsetCharge.chargeId,
                            amount: remainderDistrib
                        });

                        remainderDistrib = 0;
                    }
                }

                // We need to address what should happen if we exhaust the set of planned installments
                // to fully discount and still have remainder left to refund.
                // Here, we simply place that amount on the first (non-merged, non-reversal, non-customer payment)
                // installment.
                if (remainderDistrib < 0) {
                    installments[0].invoiceItems.push({
                        chargeId: offsetCharge.chargeId,
                        amount: remainderDistrib
                    })
                }
            } else {
                const remainderInstallment = installments.find(i => Math.abs(i.invoiceItems.sum(ii => ii.amount)) > 0.009) ||
                    installments.find(i => Math.abs(i.endTimestamp >= now)) ||
                    installments[0];
                remainderInstallment.invoiceItems.push( {
                    chargeId: offsetCharge.chargeId,
                    amount: remainder
                });
            }

            installments = [reversalInstallment, newInstallment, ...installments].filter(i => i.invoiceItems.length);
            for (const inst of installments) {
                // combine invoice items with the same chargeId
                let g = Array.from(inst.invoiceItems.groupBy(ii => ii.chargeId, ii => ii).values());
                inst.invoiceItems = g.map(gg => gg.length === 1 ? gg[0] : { chargeId: gg[0].chargeId,
                                                                            amount: gg.sum(x => x.amount) } );
            }
        } else {
            throw 'No charges available to create offset.';
        }
    } else {
        throw `Cannot find mismatched invoice for ${partialPaymentInfo.totalDue} and created at ${partialPaymentInfo.invoiceCreatedTimestamp}`;
    }

    return installments;
}

exports.createInstallments = createInstallments;
