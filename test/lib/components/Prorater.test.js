const { Prorater } = require('../../../scripts/lib/components/Prorater.js');

const sampleData = require('../../sample-data/prorationSampleData.js');

describe.each(Object.values(sampleData))('sample %#', (getData) => {
    const data = getData();
    const result = (new Prorater(data)).getProratedAmounts();
    for (const item of result.items) {
        it("should ensure each returned item has a finite numerical proratedAmount", () => {
            expect(Number.isFinite(item.proratedAmount)).toBe(true);
        });
    }

    for (const item of data.items) {
        const proratedItem = result.items.find(i => i.id === item.id);
        const proratedAmount = proratedItem.proratedAmount;
        it("should ensure a prorated item result for every input item", () => {
            expect(proratedItem).toBeDefined();
        });

        it("should ensure the prorated amount's sign matches its input item's", () => {
            if (item.amount >= 0) {
                expect(proratedAmount).toBeGreaterThanOrEqual(0);
            }
            else {
                expect(proratedAmount).toBeLessThan(0);
            }
        });

        it("should ensure the magnitude of prorated amount for each item is not too high", () => {
            expect(Math.abs(proratedAmount)).toBeLessThanOrEqual(Math.abs(parseFloat(item.amount)));
        });
    }
});
