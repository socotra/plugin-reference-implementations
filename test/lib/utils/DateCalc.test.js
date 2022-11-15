const { DateCalc } = require('../../../scripts/lib/utils/DateCalc.js');
require("../../../scripts/lib/utils/arrays.js");

const pacDateCalc = new DateCalc('America/Los_Angeles');
const estDateCalc = new DateCalc('America/New_York');
const utcDateCalc = new DateCalc();

describe('incrementMomentByMonth', () => {
    test('incrementMomentByMonth (Jan) returns expected value', () => {
        expect(pacDateCalc.incrementMonth(
            pacDateCalc.getTimestamp(2021, 1, 31))).toEqual(pacDateCalc.getTimestamp(2021, 2, 28));
    });
    test('incrementMomentByMonth (Apr) returns expected value', () => {
        expect(pacDateCalc.incrementMonth(
            pacDateCalc.getTimestamp(2021, 4, 30))).toEqual(pacDateCalc.getTimestamp(2021, 5, 30));
    });
});

describe('time zone checks', () => {
    // Feb 2: 5/8 hour difference
    const feb2_midnight_GMT = utcDateCalc.getTimestamp(2021, 1, 2, 0);
    const feb2_midnight_ET = estDateCalc.getTimestamp(2021, 1, 2, 0);
    const feb2_midnight_PT = pacDateCalc.getTimestamp(2021, 1, 2, 0);

    test('Feb 2 Time zone delta GMT/ET is expected value', () => {
        expect(feb2_midnight_GMT).toEqual(feb2_midnight_ET - 5 * 60 * 60 * 1000);
    });
    test('Feb 2 Time zone delta GMT/PT is expected value', () => {
        expect(feb2_midnight_GMT).toEqual(feb2_midnight_PT - 8 * 60 * 60 * 1000);
    });


    // July 4: 4/7 hour difference
    const jul4_midnight_GMT = utcDateCalc.getTimestamp(2021, 7, 4, 0);
    const jul4_midnight_ET = estDateCalc.getTimestamp(2021, 7, 4, 0);
    const jul4_midnight_PT = pacDateCalc.getTimestamp(2021, 7, 4, 0);

    test('July 4 Time zone delta GMT/ET is expected value', () => {
        expect(jul4_midnight_GMT).not.toEqual(jul4_midnight_ET + 4 * 60 * 60 * 1000);
    });
    test('July 4 Time zone delta GMT/PT is expected value', () => {
        expect(jul4_midnight_GMT).not.toEqual(jul4_midnight_PT + 7 * 60 * 60 * 1000);
    });
});


describe('daylight savings boundary checks', () => {
    test('daylight savings by day check OK', () => {
        const jan31_noon_PT = pacDateCalc.getTimestamp(2021, 1, 31, 12);
        const aug1_noon_PT = pacDateCalc.getTimestamp(2021, 8, 1, 12);
        let x = jan31_noon_PT;
        for (let i = 0; i < 182; i++)
            x = pacDateCalc.addToTimestamp(x, 1, 'day');

        expect(x).toEqual(aug1_noon_PT);
    });

    test('daylight savings by hour check OK', () => {
        const mar4_1am_PT = pacDateCalc.getTimestamp(2021, 3, 14, 1);
        const mar4_4am_PT = pacDateCalc.getTimestamp(2021, 3, 14, 4);

        expect(pacDateCalc.addToTimestamp(mar4_1am_PT, 2, 'hours')).toEqual(mar4_4am_PT);
    });
});

describe('date span checks', () => {
    test('span check 31 OK', () => {
        const oct31_2021_ET = spanStart = estDateCalc.getTimestamp(2021, 10, 31, 12)
        const oct31_2024_ET = estDateCalc.getTimestamp(2024, 10, 31, 12);
        const span = estDateCalc.getDateSpan(oct31_2021_ET, oct31_2024_ET, 'month');

        expect(span).toEqual([
            1635696000000,1638291600000,1640970000000,1643648400000,1646067600000,1648742400000,1651334400000,1654012800000,1656604800000,
            1659283200000,1661961600000,1664553600000,1667232000000,1669827600000,1672506000000,1675184400000,1677603600000,1680278400000,
            1682870400000,1685548800000,1688140800000,1690819200000,1693497600000,1696089600000,1698768000000,1701363600000,1704042000000,
            1706720400000,1709226000000,1711900800000,1714492800000,1717171200000,1719763200000,1722441600000,1725120000000,1727712000000
        ]);
    });

    test('span check 30 OK', () => {
        const oct30_2021_ET = spanStart = estDateCalc.getTimestamp(2021, 10, 30, 12)
        const oct30_2024_ET = estDateCalc.getTimestamp(2024, 10, 30, 12);
        const span = estDateCalc.getDateSpan(oct30_2021_ET, oct30_2024_ET, 'month');

        expect(span).toEqual([
            1635609600000,1638291600000,1640883600000,1643562000000,1646067600000,1648656000000,1651334400000,1653926400000,1656604800000,
            1659196800000,1661875200000,1664553600000,1667145600000,1669827600000,1672419600000,1675098000000,1677603600000,1680192000000,
            1682870400000,1685462400000,1688140800000,1690732800000,1693411200000,1696089600000,1698681600000,1701363600000,1703955600000,
            1706634000000,1709226000000,1711814400000,1714492800000,1717084800000,1719763200000,1722355200000,1725033600000,1727712000000
        ]);
    });
});

describe('ratio method checks', () => {
    const start = 1664596800000;
    const split = start + (20 * 1000 * 60 * 60 * 24) + (2 * 1000 * 60 * 60); // + 20 days, 2 hours
    const end = start + (40 * 1000 * 60 * 60 * 24) + (2 * 1000 * 60 * 60); // + 40 days, 2 hours

    test('linear ratio returns expected results', () => {
        expect(estDateCalc.linearRatio(start, split, end)).toBeCloseTo(0.5010395, 6);
    });

    test('socotra month count ratio returns expected results', () => {
        expect(estDateCalc.socotraMonthCountRatio(start, split, end)).toBeCloseTo(0.4974435, 6);
    });

    test('day count ratio returns expected results', () => {
        expect(estDateCalc.dayCountRatio(start, split, end)).toBeCloseTo(0.5015608, 6);
    });
});
