require('../scripts/lib/utils/arrays.js');
const fs = require('fs');
const {DateCalc} = require("../scripts/lib/utils/DateCalc.js");
const { roundMoney }= require('../scripts/main/common-options.js').options;

const jsonFromFile = (path) => JSON.parse(fs.readFileSync(path));

function midnightTonightForReversalData(data) {
    return (new DateCalc(data.tenantTimezone)).getEndOfDayTimestamp(new Date().getTime());
}

// options properties:
//   tablePath: the path to a folder with csv file(s)
//   tableInfo: literal csv data in an array, [ { tableName: "xxx", tableData: "a,b\nc,d" }]
//   Both can be used at the same time.

function createMockApi(options)
{
    let tableData = new Map();
    if (options && options.tablePath && options.tablePath.length)
    {
        const Fs = require('fs');
        const Path = require('path');

        let listOfFilesInDirectory = Fs.readdirSync(options.tablePath);

        if (options.tablePath[options.tablePath.length - 1] !== '/')
            options.tablePath += '/';

        tableData = csvToMap(listOfFilesInDirectory.map(f => [f, Fs.readFileSync(`${options.tablePath}${f}`, { encoding: 'utf8' })])
                                                    .map(f => [f[0].slice(0, f[0].length - 4), parseCSV(f[1])]));
    }
    if (options && options.tableInfo)
    {
        tableData = new Map([...tableData,
                             ...csvToMap(options.tableInfo.map(x => [x.tableName, parseCSV(x.tableData)]))]);
    }

    global.socotraApi = {
        tableLookup: (configVersion, tableName, key) =>
        {
            if (tableData.has(tableName))
            {
                const table = tableData.get(tableName);
                while (Array.isArray(key))
                    key = key[0];
                key = key.toString();
                if (table.has(key))
                {
                    return table.get(key);
                }
            }
            return "";
        }
    };
}
function csvToMap(csvArray)
{
    return csvArray.toMap(x => x[0], x => x[1].toMap(y => y[0], y => y[1]));
}
function parseCSV(csvText)
{
    const ret = [];
    let quoting = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < csvText.length; c++)
    {
        const cc = csvText[c], nc = csvText[c+1];        // Current character, next character
        ret[row] = ret[row] || [];             // Create a new row if necessary
        ret[row][col] = ret[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quoting && nc == '"') { ret[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quoting = !quoting; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quoting) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quoting) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quoting) { ++row; col = 0; continue; }
        if (cc == '\r' && !quoting) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        ret[row][col] += cc;
    }
    return ret;
}

function getPolicyAndTransactionSummary(data, dateCalc) {
    return  `
Policy Effective: ${dateCalc.formatTimestampDate(data.policy.originalContractStartTimestamp)}
Transaction: ${data.transactionType}
Effective: ${dateCalc.formatTimestampDate(data.policy.modifications.last().effectiveTimestamp)}
Policy Ends: ${dateCalc.formatTimestampDate(data.policy.effectiveContractEndTimestamp)}
Payment Schedule Name: ${data.paymentScheduleName}
`;
}

function getInstallmentCoverageSummary(inst, dateCalc) {
    return `
Coverage: ${dateCalc.formatTimestampDate(inst.startTimestamp)} - ${dateCalc.formatTimestampDate(inst.endTimestamp)}
    Amount:     ${roundMoney(inst.invoiceItems.filter(ii => !ii.chargeId.includes('_comm_')).sum(ii => ii.amount))} ItemCount: ${inst.invoiceItems.length}
    ItemCount:  ${inst.invoiceItems.length}
    Issue Date: ${dateCalc.formatTimestampDate(inst.issueTimestamp)}
    Due Date:   ${dateCalc.formatTimestampDate(inst.dueTimestamp)}    
`;
}

function getInstallmentsResultSummary(data, installments, dateCalc) {
    const nonCommissionCharges = data.charges.filter(ch => ch.type !== 'commission');
    return `
Transaction Type: ${data.transactionType}
${data.charges.length} charges
${installments.flatMap(inst => inst.invoiceItems).length} invoice items
Policy Start:   ${dateCalc.formatTimestampDate(data.policy.originalContractStartTimestamp)}
Trans Eff Date: ${dateCalc.formatTimestampDate(data.policy.modifications.last().effectiveTimestamp)}
Policy End:     ${dateCalc.formatTimestampDate(data.policy.effectiveContractEndTimestamp)}
Num Gen Invoices / Amt:    ${data.policy.invoices.length} / ${data.policy.invoices.sum(i => i.totalDue)}
Num Installments:          ${installments.length}
Total Original Amount:     ${roundMoney(nonCommissionCharges.sum(ch => ch.originalAmount))}
Total Prev Invoiced:       ${roundMoney(nonCommissionCharges.sum(ch => ch.previouslyInvoicedAmount))}
Total Net Charge Amounts:  ${roundMoney(nonCommissionCharges.sum(ch => ch.amount))}
Total Inv Item Amounts:    ${roundMoney(installments.flatMap(inst => inst.invoiceItems).filter(ii => !ii.chargeId.includes('_comm_')).sum(ii => ii.amount))}
Total New Inst Fees: ${installments.every(i => i.installmentFees) ? roundMoney(installments.sum(inst => inst.installmentFees.sum(f => f.amount))) : 'N/A'}
Total Other Fees To Charge ${roundMoney(data.charges.filter(ch => ch.type === 'fee').sum(ch => ch.amount))}

${installments.map((i) => getInstallmentCoverageSummary(i, dateCalc)).join('')}`;
}

function getInvoiceTableSummary(data, installments, dateCalc) {

    let times = data.policy.invoices.map(inv => inv.startTimestamp);
    times.push(...data.plannedInvoices.map(pi => pi.startTimestamp));
    times.push(...installments.map(inst => inst.startTimestamp));

    times = times.distinct()
        .orderBy(x => x);

    let results = [];

    const nowTimestamp = new Date().getTime();
    const effTimestamp = data.policy.modifications.last().effectiveTimestamp;

    let generatedTotal = 0;
    let plannedTotal = 0;
    let newInstallmentsTotal = 0;
    let nowDividerShown = false;
    let effDividerShown = false;
    let totalInstallmentFees = 0;
    let newGrandTotal = 0;
    let oldGrandTotal = 0;
    for (let time of times) {
        const gen = data.policy.invoices.filter(x => x.startTimestamp === time);
        const planned = data.plannedInvoices.filter(x => x.startTimestamp === time);
        let installmentsForTime = installments.filter(x => x.startTimestamp === time);
        let didGen;

        while (gen.length || planned.length || installmentsForTime.length)
        {
            didGen = false;
            let newTotalForLine = 0;
            let oldTotal = 0;
            if (!nowDividerShown && time >= nowTimestamp)
            {
                nowDividerShown = true;
                results.push({'START': '<-- NOW -->'})
            }
            if (!effDividerShown && time >= effTimestamp)
            {
                effDividerShown = true;
                results.push({'START': '<-- EFFECTIVE -->'});
            }
            g = gen.shift();

            let genAmtStr;
            if (g)
            {
                didGen = true;
                genAmtStr = formatNum(g.totalDue);
                generatedTotal += g.totalDue;
                newTotalForLine += g.totalDue;
                oldGrandTotal += g.totalDue;
                oldTotal += g.totalDue;
            }
            let plannedAmtStr;
            let p;
            if (!didGen)
            {
                p = planned.shift();

                if (p)
                {
                    let amt = p.financialTransactions
                        .filter(ft => ft.type !== 'commission')
                        .sum(ft => ft.amount);
                    plannedTotal += amt;
                    oldTotal += amt;
                    oldGrandTotal += amt;
                    plannedAmtStr = formatNum(amt);
                }
            }
            let newAmtStr;
            let newIssueStr;
            let newDueStr;
            let instFeesStr;
            let n;
            if (!didGen)
            {
                n = installmentsForTime.shift();

                if (n) {
                    const amt = n.invoiceItems
                        .filter(ii => !ii.chargeId.includes('_comm_'))
                        .sum(ii => ii.amount);
                    newInstallmentsTotal += amt;
                    newAmtStr = formatNum(amt);
                    newIssueStr = dateCalc.formatTimestampDate(n.issueTimestamp);
                    newDueStr = dateCalc.formatTimestampDate(n.dueTimestamp);
                    const installmentFees = n.installmentFees.sum(f => f.amount);
                    totalInstallmentFees += installmentFees;
                    instFeesStr = formatNum(installmentFees);
                    newTotalForLine += amt;
                }
            }
            const endStr = dateCalc.formatTimestampDate((n && n.endTimestamp) || (p && p.endTimestamp) || (g && g.endTimestamp));
            newGrandTotal += newTotalForLine;

            let rawEntry = {
                'START': dateCalc.formatTimestampDate(time),
                'END': endStr,
                'GENERATED': genAmtStr,
                'OLD PLANNED': plannedAmtStr,
                'OLD TOTAL': formatNum(oldTotal),
                'NEW': newAmtStr,
                'ISSUE': newIssueStr,
                'DUE': newDueStr,
                'NEW TOTAL': formatNum(newTotalForLine),
                'DIFF': formatNum(newTotalForLine - oldTotal),
                'INST FEES': instFeesStr
            }

            let refinedEntry = Object.fromEntries(Object.entries(rawEntry).filter(([_, val]) => val != undefined));
            results.push(refinedEntry);
        }
    }
    results.push({});
    results.push({
        'START': 'TOTAL',
        'GENERATED': formatNum(generatedTotal),
        'OLD PLANNED': formatNum(plannedTotal),
        'OLD TOTAL': formatNum(oldGrandTotal),
        'NEW': formatNum(newInstallmentsTotal),
        'NEW TOTAL': formatNum(newGrandTotal),
        'DIFF': formatNum(newGrandTotal - oldGrandTotal),
        'INST FEES': formatNum(totalInstallmentFees)
    });
    return results;
}

function formatNum(num) {
    if (typeof num === 'string')
        num = parseFloat(num);
    return roundMoney(num).toFixed(2);
}

function commonAssertions(originalInputData, installments) {
    it('should ensure all installments have a valid start timestamp', () => {
        expect(installments.filter(i => !Number.isInteger(i.startTimestamp))).toHaveLength(0);
    });

    it('should ensure all installments have a valid end timestamp', () => {
        expect(installments.filter(i => !Number.isInteger(i.endTimestamp))).toHaveLength(0);
    });

    it('should ensure all installment invoice items have a valid amount', () => {
        expect(installments.flatMap(i => i.invoiceItems).filter(item => !Number.isFinite(item.amount))).toHaveLength(0);
    });

    it('should ensure there are no overlaps in the installment schedule', () => {
        let noOverlaps = 0;
        for (let i = 0; i < installments.length - 1; i++) {
            if (installments[i].endTimestamp > installments[i + 1].startTimestamp) {
                noOverlaps++;
            }
        }

        expect(noOverlaps).toEqual(0);
    });

    it('should ensure the total amount for each nonzero charge is accounted for across the set of installments', () => {
        let mismatches = originalInputData.charges.filter(ch => {
            const amt = roundMoney(parseFloat(ch.amount));
            const retAmt = roundMoney(installments.flatMap(
                inst => inst.invoiceItems).filter(ii => ii.chargeId == ch.chargeId).sum(ii => ii.amount));
            return amt != retAmt;
        });

        expect(mismatches).toHaveLength(0);
    });

    it('should ensure there are no inverse dates', () => {
        let inverseDates = installments.flatMap(
            inst => inst.invoiceItems).filter(items => items.startTimestamp > items.endTimestamp);

        expect(inverseDates).toHaveLength(0);
    });
}

function displaySummary(originalInputData, installments, dateCalc) {
    // Display invoice summary info, installments result summary
    console.log(getPolicyAndTransactionSummary(originalInputData, dateCalc));
    console.table(getInvoiceTableSummary(originalInputData, installments, dateCalc));
    console.log(getInstallmentsResultSummary(originalInputData, installments, dateCalc));
}

function getInvoiceItemSum(installment) {
    return installment.invoiceItems.map(i => i.amount).reduce((a, b) => a + b, 0);
}

function getPairs(arr) {
    return arr.map( (v, i) => arr.slice(i + 1).map(w => [v, w]) ).flat();
}

module.exports = {
    createMockApi,
    jsonFromFile,
    getInvoiceTableSummary,
    getInstallmentsResultSummary,
    getPolicyAndTransactionSummary,
    midnightTonightForReversalData,
    commonAssertions,
    displaySummary,
    getInvoiceItemSum,
    getPairs
}
