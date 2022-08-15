require("../../../scripts/lib/utils/arrays.js");

const nums = [1.05, 11.9, -3, 6.1, 4.2, 6.3, 1.9, 2.4, -5, 7.3, 0, 6.2, 4.4, 12.6, 8];
const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];

describe('sums, counts, selection', () => {
    test('nums sum without lambda matches identity lambda', () => {
        expect(nums.sum()).toEqual(nums.sum(x => x));
    });
    test('nums max without lambda matches identity lambda', () => {
        expect(nums.max()).toEqual(nums.max(x => x));
    });
    test('nums min without lambda matches identity lambda', () => {
        expect(nums.min()).toEqual(nums.min(x => x));
    });
    test('nums count is as expected', () => {
        expect(nums.count()).toEqual(15);
    });
    test('positive nums count is as expected', () => {
        expect(nums.count(x => x > 0)).toEqual(12);
    });
    test('nums first returns expected value', () => {
        expect(nums.first()).toEqual(1.05);
    });
    test('nums first negative returns expected value', () => {
        expect(nums.first(x => x < 0)).toEqual(-3);
    });
    test('nums last returns expected value', () => {
        expect(nums.last()).toEqual(8);
    });
    test('nums last negative returns expected value', () => {
        expect(nums.last(x => x < 0)).toEqual(-5);
    });
    test('nums sum of values > 5 returns expected value', () => {
        expect(nums.sum(x => x > 5)).toEqual(7);
    });
});

describe('grouping', () => {
    test('nums groupBy group 6 returns expected value', () => {
        const groups = nums.groupBy(x => Math.floor(x), x => x);
        expect(groups.get(6)).toEqual([6.1, 6.3, 6.2]);
    });
    test('groupBy words of certain length returns expected set', () => {
        expect(words.groupBy(x => x.length, x => x).get(4)).toHaveLength(2);
    });
});

describe('ordering', () => {
    test('nums orderBy returns expected value', () => {
        expect(nums.orderBy(x => Math.abs(x))).toEqual(
            [0, 1.05, 1.9, 2.4, -3, 4.2, 4.4, -5, 6.1, 6.2, 6.3, 7.3, 8, 11.9, 12.6]);
    });
    test('nums orderBy descending returns expected value', () => {
        expect(nums.orderByDescending(x => Math.abs(x))).toEqual(
            [12.6, 11.9, 8, 7.3, 6.3, 6.2, 6.1, -5, 4.4, 4.2, -3, 2.4, 1.9, 1.05, 0]);
    });
});










test('orderBy words by particular character returns expected value', () => {
    expect(words.orderBy(x => x[1])).toEqual(['seven', 'three', 'five', 'six', 'one', 'four', 'two']);
});
test('orderByDescending words by particular character returns expected value', () => {
    expect(words.orderByDescending(x => x[2])).toEqual(['six', 'five', 'seven', 'four', 'three', 'two', 'one']);
});