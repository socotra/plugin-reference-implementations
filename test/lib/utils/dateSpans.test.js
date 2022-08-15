require('../../../scripts/lib/utils/arrays.js');
const { DateCalc } = require('../../../scripts/lib/utils/DateCalc.js');
const dateCalc = new DateCalc("America/Los_Angeles");

const start = dateCalc.getTimestamp(2022, 6, 18, 9, 9, 9);
const end = dateCalc.getTimestamp(2023, 11, 4, 3, 3, 3);

test('normal date span returns expected sequence', () => {
    const sequence = dateCalc.getDateSequence(start, end, { interval: 'month', anchorTimestamp: start }).sequence;

    const expected = [
        '2022-06-18 09:09:09 to 2022-07-18 09:09:09',
        '2022-07-18 09:09:09 to 2022-08-18 09:09:09',
        '2022-08-18 09:09:09 to 2022-09-18 09:09:09',
        '2022-09-18 09:09:09 to 2022-10-18 09:09:09',
        '2022-10-18 09:09:09 to 2022-11-18 09:09:09',
        '2022-11-18 09:09:09 to 2022-12-18 09:09:09',
        '2022-12-18 09:09:09 to 2023-01-18 09:09:09',
        '2023-01-18 09:09:09 to 2023-02-18 09:09:09',
        '2023-02-18 09:09:09 to 2023-03-18 09:09:09',
        '2023-03-18 09:09:09 to 2023-04-18 09:09:09',
        '2023-04-18 09:09:09 to 2023-05-18 09:09:09',
        '2023-05-18 09:09:09 to 2023-06-18 09:09:09',
        '2023-06-18 09:09:09 to 2023-07-18 09:09:09',
        '2023-07-18 09:09:09 to 2023-08-18 09:09:09',
        '2023-08-18 09:09:09 to 2023-09-18 09:09:09',
        '2023-09-18 09:09:09 to 2023-10-18 09:09:09',
        '2023-10-18 09:09:09 to 2023-11-04 03:03:03'
    ];

    expect(sequence.map(
        t => `${dateCalc.formatTimestamp(t.startTimestamp)} to ${dateCalc.formatTimestamp(t.endTimestamp)}`)).toEqual(
            expected);
});


test('remainder first date span returns expected sequence', () => {
    const sequence = dateCalc.getDateSequence(start, end, { interval: 'month', anchorTimestamp: end }).sequence;

    const expected = [
        '2022-06-18 09:09:09 to 2022-07-04 03:03:03',
        '2022-07-04 03:03:03 to 2022-08-04 03:03:03',
        '2022-08-04 03:03:03 to 2022-09-04 03:03:03',
        '2022-09-04 03:03:03 to 2022-10-04 03:03:03',
        '2022-10-04 03:03:03 to 2022-11-04 03:03:03',
        '2022-11-04 03:03:03 to 2022-12-04 03:03:03',
        '2022-12-04 03:03:03 to 2023-01-04 03:03:03',
        '2023-01-04 03:03:03 to 2023-02-04 03:03:03',
        '2023-02-04 03:03:03 to 2023-03-04 03:03:03',
        '2023-03-04 03:03:03 to 2023-04-04 03:03:03',
        '2023-04-04 03:03:03 to 2023-05-04 03:03:03',
        '2023-05-04 03:03:03 to 2023-06-04 03:03:03',
        '2023-06-04 03:03:03 to 2023-07-04 03:03:03',
        '2023-07-04 03:03:03 to 2023-08-04 03:03:03',
        '2023-08-04 03:03:03 to 2023-09-04 03:03:03',
        '2023-09-04 03:03:03 to 2023-10-04 03:03:03',
        '2023-10-04 03:03:03 to 2023-11-04 03:03:03',
    ];

    expect(sequence.map(
        t => `${dateCalc.formatTimestamp(t.startTimestamp)} to ${dateCalc.formatTimestamp(t.endTimestamp)}`)).toEqual(
            expected);
});