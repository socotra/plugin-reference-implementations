const { getEquityDate } = require('../../../scripts/lib/components/equityDate.js');
const { getPolicyResponse2, getPolicyResponse3 } = require('../../sample-data/policyResponseSampleData.js');

describe('Equity date lambda implementation', () => {
    describe.each([getPolicyResponse2, getPolicyResponse3])( 'Boundary conditions %#', (getData) => {
        let policyResponse;
        beforeEach(() => {
            policyResponse = getData();
            global.socotraApi = {
                fetchByLocator: x => policyResponse
            };
            global.Policy = '';
        });

        it('should return the very beginning of earliest coverage if paid amount is 0', () => {
            const { equityDate } = getEquityDate('mock-policy-locator', 0);
            expect(equityDate).toEqual(parseInt(policyResponse.originalContractStartTimestamp));
        });

        it('should return timestamp of 0 and message if amount < 0', () => {
            const { equityDate, message } = getEquityDate('mock-policy-locator', -1);
            expect(equityDate).toEqual(0);
            expect(message).toBe('Paid amount must be nonnegative.');
        });

        it('should return timestamp of 0 and message if amount exceeds price of policy', () => {
            const { equityDate, message } = getEquityDate('mock-policy-locator',100000000);
            expect(equityDate).toEqual(0);
            expect(message).toBe('Paid amount exceeds policy value.');
        });
    });

    describe('Example policy results', () => {
        describe('Policy with single coverage', () => {
            beforeEach(() => {
                const policyResponse = getPolicyResponse3();
                global.socotraApi = {
                    fetchByLocator: x => policyResponse
                };
                global.Policy = '';
            });

            it('should return result for first quarter of segment for 1/4 policy amount', () => {
                const { equityDate } = getEquityDate('mock-policy-locator', 750);
                expect(equityDate).toEqual(1672480800000);
            });

            it('should return result for halfway through policy for 1/2 policy amount', () => {
                const { equityDate } = getEquityDate('mock-policy-locator', 1500);
                expect(equityDate).toEqual(1680364800000);
            });

            it('should return the end timestamp of the policy if exact amount of policy', () => {
                const { equityDate } = getEquityDate('mock-policy-locator',3000 );
                expect(equityDate).toEqual(1696132800000);
            });
        });

        describe('Multiple coverages of unequal length, and start/end times', () => {
            beforeEach(() => {
                const policyResponse = getPolicyResponse2();
                global.socotraApi = {
                    fetchByLocator: x => policyResponse
                };
                global.Policy = '';
            });

            it('should return result within first segment for amount <= ~254.79', () => {
                const { equityDate } = getEquityDate('mock-policy-locator', 200);
                expect(equityDate).toBeLessThanOrEqual(1667275200000);
            });

            it('should return result in the second segment for amount > ~254.79 and <= ~1091.57', () => {
                const { equityDate } = getEquityDate('mock-policy-locator',345);
                expect(equityDate).toBeGreaterThan(1667275200000);
                expect(equityDate).toBeLessThanOrEqual(1672549200000);
            });

            it('should return result in the third segment for amount > ~1091.57 and <= ~4402.65', () => {
                const { equityDate } = getEquityDate('getEquityDate', 2400 );
                expect(equityDate).toBeGreaterThan(1672549200000);
                expect(equityDate).toBeLessThanOrEqual(1682913600000);
            });

            it('should return result in the fourth segment for amount > ~4402.65 and <= ~6500.00', () => {
                const { equityDate } = getEquityDate('mock-policy-locator', 5000);
                expect(equityDate).toBeGreaterThan(1682913600000);
                expect(equityDate).toBeLessThanOrEqual(1696132800000);
            });

            it('should return the time of the end of the policy if amount is exact price of policy', () => {
                const { equityDate } = getEquityDate('mock-policy-locator',6500);
                expect(equityDate).toEqual(1696132800000);
            })
        });
    });
});