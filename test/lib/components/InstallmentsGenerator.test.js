const { DateCalc } = require('../../../scripts/lib/utils/DateCalc.js');
const { InstallmentsGenerator } = require('../../../scripts/lib/components/InstallmentsGenerator.js');
const { displaySummary,
    commonAssertions,
    getInvoiceItemSum,
    getPairs } = require('../../test-helpers.js');
const { validSamples, invalidSamples } = require('../../sample-data/paymentScheduleSampleData.js');
const { roundMoney } = require('../../../scripts/main/common-options.js').options;


describe('installments plugin (invalid input)', () => {
    let data = invalidSamples.getUnrecognizedScheduleChange();

    it('should throw an error if given an unrecognized schedule name', () => {
        expect(() => { (new InstallmentsGenerator(data)).getInstallments() }).toThrow();
    });
});

/**
 * Default behavior across full range of transactions
 */
describe.each(Object.entries(validSamples))('default behavior sample %s', (sampleName, getData) => {
    const generator = new InstallmentsGenerator(getData());
    const generator2 = new InstallmentsGenerator(getData());

    // keep fixed for testing
    generator.nowTimestamp = 1641013200000;
    generator2.nowTimestamp = 1641013200000;

    const { installments } = generator.getInstallments();
    const originalInputData = generator2.data; /* reload in case mutated */
    const dateCalc = new DateCalc(originalInputData.tenantTimeZone,
        originalInputData.policy.originalContractStartTimestamp, 'months');

    displaySummary(originalInputData, installments, dateCalc);

    commonAssertions(originalInputData, installments);
});

/**
 * Options behavior
 */
describe('installment fees', () => {
    const options = { installmentFeeAmount: 1,
        installmentFeeName: 'added fee',
        installmentFeeDescription: 'an additional fee'}
    const { installments } = (new InstallmentsGenerator(validSamples.getNewBusiness1(), options)).getInstallments();
    const originalInputData = (new InstallmentsGenerator(validSamples.getNewBusiness1(), options)).data;

    it('should attach an installment fee with name and description to each', () => {
        installments.forEach(installment => {
            const fee = installment.installmentFees[0];
            expect(fee.feeName).toEqual('added fee');
            expect(fee.description).toEqual('an additional fee');
            expect(fee.amount).toEqual(1);
        });
    });

    commonAssertions(originalInputData, installments);
});

describe('remainder installments', () => {
    // RemainderInstallmentsFirst determines what happens when a given time span and increment
    // requires a "remainder" segment (unequal to the increment) in order to cover
    // the whole timespan.
    //
    // For example, if a timespan runs from midnight Jan 1 to 03:00 the following
    // Jan 1, and you opt for monthly increments, there will have to be a three-hour "remainder" installment
    // in the sequence covering the timespan. If `remainderInstallmentsFirst` is `false` (default),
    // this segment will be tacked on to the end of the sequence. If `remainderInstallmentsFirst` is `true`,
    // the remainder will be placed first in the sequence by having the first item cover Jan 1 midnight to
    // 03:00, followed by month-over-month segments beginning/ending 03:00 until the end of the timespan.
    // Note also that in the tests  below, remainder installments are elided due to subsequent cleanup logic.
    describe('default behavior', () => {
        const generator = new InstallmentsGenerator(validSamples.getNewBusiness8());
        const generator2 = new InstallmentsGenerator(validSamples.getNewBusiness8());

        // keep fixed for testing
        generator.nowTimestamp = 1660316037757;
        generator2.nowTimestamp = 1660316037757;

        const { installments } = generator.getInstallments();
        const originalInputData = generator2.data;

        it('should make adjustments for remainder time at the end of the span', () => {
            expect(installments.map(
                i => { return { start: i.startTimestamp, end: i.endTimestamp }})).toEqual(
                [
                    {
                        "start": 1659326400000,
                        "end": 1662004800000
                    },
                    {
                        "start": 1662004800000,
                        "end": 1664596800000
                    },
                    {
                        "start": 1664596800000,
                        "end": 1667275200000
                    },
                    {
                        "start": 1667275200000,
                        "end": 1669870800000
                    },
                    {
                        "start": 1669870800000,
                        "end": 1672549200000
                    }
                ]
            )
        });

        commonAssertions(originalInputData, installments);
    });

    describe('remainderInstallmentsFirst == true', () => {
        const generator = new InstallmentsGenerator(validSamples.getNewBusiness8(),
            {remainderInstallmentsFirst: true});

        const generator2 = new InstallmentsGenerator(validSamples.getNewBusiness8(),
            {remainderInstallmentsFirst: true});

        // keep fixed for testing
        generator.nowTimestamp = 1660316037757;
        generator2.nowTimestamp = 1660316037757;

        const { installments } = generator.getInstallments();
        const originalInputData = generator2.data;

        it('should make adjustments for remainder time at the beginning of the span', () => {
            expect(installments.map(
                i => { return { start: i.startTimestamp, end: i.endTimestamp }})).toEqual(
                [
                    {
                        "start": 1659326480000,
                        "end": 1662004880000
                    },
                    {
                        "start": 1662004880000,
                        "end": 1664596880000
                    },
                    {
                        "start": 1664596880000,
                        "end": 1667275280000
                    },
                    {
                        "start": 1667275280000,
                        "end": 1669870880000
                    },
                    {
                        "start": 1669870880000,
                        "end": 1672549280000
                    }
                ]
            )
        });

        commonAssertions(originalInputData, installments);
    });
});

describe('installment weights', () => {
    const generator = new InstallmentsGenerator(validSamples.getNewBusiness9(),
        {firstInstallmentWeight: 0.75});

    const generator2 = new InstallmentsGenerator(validSamples.getNewBusiness9(),
        {firstInstallmentWeight: 0.75});

    // keep fixed for testing
    generator.nowTimestamp = 1641013200000;
    generator2.nowTimestamp = 1641013200000;

    const { installments } = generator.getInstallments();
    const originalInputData = generator2.data;

    const firstInvoiceSum = getInvoiceItemSum(installments[0]);
    let remainderSum = 0;
    for (let i = 1; i < installments.length; i++) {
        remainderSum += getInvoiceItemSum(installments[i]);
    }

    it('should set first invoice weight accordingly', () => {
        const proportion = firstInvoiceSum / (firstInvoiceSum + remainderSum);

        expect(proportion).toBeGreaterThan(0.74);
        expect(proportion).toBeLessThan(0.76);
        expect(1).toEqual(1);
    });

    commonAssertions(originalInputData, installments);
});

describe('carry forward behavior', () => {
    const generator = new InstallmentsGenerator(validSamples.getNewBusiness9(), { carryForwardThreshold: 300});

    const generator2 = new InstallmentsGenerator(validSamples.getNewBusiness9(), { carryForwardThreshold: 300});

    // keep fixed for testing
    generator.nowTimestamp = 1641013200000;
    generator2.nowTimestamp = 1641013200000;

    const { installments } = generator.getInstallments();
    const originalInputData = generator2.data;


    it('should result in fewer installments since amounts will be reassigned to a smaller set', () => {
        expect(installments.length).toBeLessThan(10);
    });

    commonAssertions(originalInputData, installments);
});

describe('leveling threshold behavior', () => {
    const levelingThreshold = 0.001;
    const generator = new InstallmentsGenerator(validSamples.getNewBusiness9(),
        {levelingThreshold});

    const generator2 = new InstallmentsGenerator(validSamples.getNewBusiness9(),
        {levelingThreshold});

    // keep fixed for testing
    generator.nowTimestamp = 1641013200000;
    generator2.nowTimestamp = 1641013200000;

    const { installments } = generator.getInstallments();
    const originalInputData = generator2.data;


    it('should result in installments leveled within the specified range', () => {
        const diffs = getPairs(installments).map(p => Math.abs(p[0] - p[1]));
        expect(Math.max(...diffs) <= levelingThreshold);
    });

    commonAssertions(originalInputData, installments);
});
