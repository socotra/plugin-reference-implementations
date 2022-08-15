require('../../../scripts/lib/utils/arrays.js');
const { DateCalc } = require('../../../scripts/lib/utils/DateCalc.js');
const dateCalc = new DateCalc("America/Los_Angeles");

describe('360days functionality (DateCalc)', () => {
    for (let i = 0; i < 1000; i++) {
        let start = randomTimestamp();
        let end = randomTimestamp();
        let mid = Math.round(start + (end - start) * randomFloat());
    
        let a = dateCalc.dayCount360(start, mid);
        let b = dateCalc.dayCount360(mid, end);
        let c = dateCalc.dayCount360(start, end);
    
        test(`it returns expected value for start (${start}), end (${end}), mid (${mid})`, () => {
            expect(Math.abs(c - a - b)).toBeLessThan(0.0000000001);
        });
    }
});

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
function randomFloat(min = 0, max = 1.0) {
    return Math.random() * (max - min) + min;
}
function randomTimestamp() {
    let year = randomInt(2019, 2020);
    let month = randomInt(1, 13);
    let day;
    switch (month)
    {
        case 2:
            if (year % 4 === 0 && year !== 2000)
                day = randomInt(1, 30);
            else
                day = randomInt(1, 29);
            break;
        case 4: case 6: case 9: case 11:
            day = randomInt(1, 31);
            break;
        default:
            day = randomInt(1, 32);
            break;
    }
    
    return dateCalc.getTimestamp(year, month, day, randomInt(0, 24), randomInt(0, 60), randomInt(0, 60), randomInt(0, 1000));
}