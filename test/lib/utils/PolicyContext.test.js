const { PolicyContext } = require('../../../scripts/lib/utils/PolicyContext.js');
const { getPolicyResponse1 } = require('../../sample-data/policyResponseSampleData.js');

describe('PolicyContext utility', () => {
    const context = new PolicyContext(getPolicyResponse1());

    test('#getPolicy returns policy', () => {
        expect(context.getPolicy()).toEqual(getPolicyResponse1());
    });

    test('#getExposure returns proper exposure if locator exists', () => {
        const exposure = context.getExposure('828c8652-6fef-4a2d-b52f-b4b65dbcbda9');
        expect(exposure).toBeDefined();
        expect(exposure.name).toEqual('vehicle');
        expect(exposure.perils).toHaveLength(2);
    });

    test('#getExposure returns `undefined` if locator does not exist', () => {
        expect(context.getExposure('no-such-locator')).toBeUndefined();
    });

    test('#getPeril returns proper peril if locator exists', () => {
        const peril = context.getPeril('6b884c3b-a067-491e-aa22-751d3faae8c4');
        expect(peril).toBeDefined();
        expect(peril.name).toEqual('comprehensive');
        expect(peril.createdTimestamp).toEqual('1646278487494');
        expect(peril.characteristics).toHaveLength(5);
    });

    test('#getPeril returns `undefined` if locator does not exist', () => {
        expect(context.getPeril('no-such-peril')).toBeUndefined();
    });

    test('#getPolicyModification returns proper modification if locator exists', () => {
        const modification = context.getPolicyModification('af284fba-ad65-4558-b6a3-1d697d3fb2ff');
        expect(modification).toBeDefined();
        expect(modification.name).toEqual('modification.policy.create');
        expect(modification.createdTimestamp).toEqual('1646278487494');
        expect(modification.premiumChange).toEqual('901.77');
    });

    test('#getPolicyModification returned `undefined` if locator does not exist', () => {
        expect(context.getPolicyModification('no-such-mod')).toBeUndefined();
    });

    test('#getPolicyCharacteristics returns proper policy characteristics if locator exists', () => {
        const policyChars = context.getPolicyCharacteristics('c50e0225-5ed5-4d8c-a4e1-b9e1e9d2b4d0');
        expect(policyChars).toBeDefined();
        expect(policyChars.createdTimestamp).toEqual('1646278498723');
        expect(policyChars.grossPremium).toEqual('980.70');
        expect(policyChars.fieldValues.channel[0]).toEqual('Agent');
    });

    test('#getPolicyCharacteristics returns `undefined` if locator does not exist', () => {
        expect(context.getPolicyCharacteristics('no-such-chars')).toBeUndefined();
    });

    test('#getExposureCharacteristics returns proper object if locator exists', () => {
        const exposureChars = context.getExposureCharacteristics('87e7f55e-8ab5-40ba-8e47-291bf1e9fae1');
        expect(exposureChars).toBeDefined();
        expect(exposureChars.issuedTimestamp).toEqual('1646278491735');
        expect(exposureChars.fieldValues.license_plate[0]).toEqual('THX1138');
    });

    test('#getExposureCharacteristics returns `undefined` if locator does not exist', () => {
        expect(context.getExposureCharacteristics('no-such-exposureChars')).toBeUndefined();
    });

    test('#getPerilCharacteristics returns proper object if locator exists', () => {
        const perilChars = context.getPerilCharacteristics('d7943e19-2a2f-40e6-bc21-b41f3b1d5275');
        expect(perilChars).toBeDefined();
        expect(perilChars.createdTimestamp).toEqual('1646278498723');
        expect(perilChars.replacedTimestamp).toEqual('1646278508729');
        expect(perilChars.premium).toEqual('568.36');
    });

    test('#getPerilCharacteristics returns `undefined` if locator does not exist', () => {
        expect(context.getPerilCharacteristics('no-such-perilChars')).toBeUndefined();
    });

    test('#allExposureCharacteristics returns all exposure characteristics in policy', () => {
        const allExposureChars = context.allExposureCharacteristics();
        expect(allExposureChars).toHaveLength(1);
        expect(allExposureChars[0].locator).toEqual('87e7f55e-8ab5-40ba-8e47-291bf1e9fae1');
    });

    test('#allPerils returns all perils in policy', () => {
        const allPerils = context.allPerils();
        expect(allPerils).toHaveLength(2);
        expect(allPerils.map(p => p.name)).toEqual(['comprehensive', 'collision']);
    });

    test('#allPerilCharacteristics returns all peril characteristics in policy', () => {
        const allPerilChars = context.allPerilCharacteristics();
        expect(allPerilChars).toHaveLength(10);
        expect(allPerilChars.map(pc => pc.locator)).toEqual([
           'c0c83d07-e99e-43a6-9377-5c2756371a22',
           'b8639abd-b7e2-4997-8914-6d32373d223b',
           'fe40911b-d592-4cbf-b4b7-aac7e9c5218b',
           '50307fa9-e88e-420a-9568-711a11f4a253',
           'd21e4c3d-9c08-4826-be62-e7190d54c6c6',
           '33eb4a8f-24fa-464b-a763-0a8bb0aca543',
           '396984a8-23d2-4866-a9f3-025c4fb3b9a4',
           'd7943e19-2a2f-40e6-bc21-b41f3b1d5275',
           '148be671-96c7-4a38-b0b3-de2472f3e148',
           'a30ca077-d2f3-4c2a-9528-5ee3159edc00'
        ]);
    });

    test('#getFieldValue returns corresponding field value if it exists', () => {
        const policyChars = context.getPolicyCharacteristics('c50e0225-5ed5-4d8c-a4e1-b9e1e9d2b4d0');
        expect(context.getFieldValue(policyChars,
            'run_third_party_reports')).toEqual('Yes - Please Run Reports - To Provide the Best Quote');
        expect(context.getFieldValue(policyChars,'10_year_felony_conviction')).toEqual('No');
    });

    test('#getFieldValue returns `undefined` if field value does not exist', () => {
        const policyChars = context.getPolicyCharacteristics('c50e0225-5ed5-4d8c-a4e1-b9e1e9d2b4d0');
        expect(context.getFieldValue(policyChars, 'no-such-field-key')).toBeUndefined();
    });

    test('#getFieldValueInt returns numerical field value if it exists', () => {
        const exposureChars = context.getExposureCharacteristics('87e7f55e-8ab5-40ba-8e47-291bf1e9fae1');
        expect(Number.isInteger(context.getFieldValueInt(exposureChars, 'annual_miles'))).toBe(true);
    });

    test('#getFieldValueInt returns `undefined` if field value does not exist', () => {
        const exposureChars = context.getExposureCharacteristics('87e7f55e-8ab5-40ba-8e47-291bf1e9fae1');
        expect(context.getFieldValueInt(exposureChars, 'no-such-field-key')).toBeUndefined();
    });

    test('#getFieldValueFloat returns numerical field value if it exists', () => {
        const exposureChars = context.getExposureCharacteristics('87e7f55e-8ab5-40ba-8e47-291bf1e9fae1');
        const floatResult = context.getFieldValueFloat(exposureChars, 'vehicle_value');
        const isFloat = typeof floatResult === 'number' && !Number.isNaN(floatResult) && !Number.isInteger(floatResult);
        expect(isFloat).toBe(true);
    });

    test('#getFieldValueFloat returns `undefined` if field value does not exist', () => {
        const exposureChars = context.getExposureCharacteristics('87e7f55e-8ab5-40ba-8e47-291bf1e9fae1');
        expect(context.getFieldValueFloat(exposureChars, 'no-such-field-key')).toBeUndefined();
    });
});