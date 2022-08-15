/*
  This class provides methods to easily retrieve
  PolicyResponse component data by the component's locator.
*/

require('./arrays.js');

class PolicyContext
{
    #policy;

    // Maps (cache)
    #exposuresMap;
    #perilsMap;
    #policyModificationsMap;
    #policyCharsMap;
    #exposureCharsMap;
    #perilCharsMap;

    // Arrays (cache)
    #allPerils;
    #allExposureCharacteristics;
    #allPerilCharacteristics;

    // We can make #privateMethods after upgrading v8
    constructor(policy)
    {
        this.#policy = policy;
    }
    getPolicy()
    {
        return this.#policy;
    }
    getExposure(locator)
    {
        if (!this.#exposuresMap)
        {
            this.#exposuresMap =
                this.#policy
                    .exposures
                    .toMap(p => p.locator);
        }
        return this.#exposuresMap.get(locator);
    }
    getPeril(locator)
    {
        if (!this.#perilsMap)
        {
            this.#perilsMap =
                this.#policy
                    .exposures
                    .flatMap(ex => ex.perils)
                    .toMap(p => p.locator);
        }
        return this.#perilsMap.get(locator);
    }
    getPolicyModification(locator)
    {
        if (!this.#policyModificationsMap)
        {
            this.#policyModificationsMap =
                this.#policy
                    .modifications
                    .toMap(m => m.locator);
        }
        return this.#policyModificationsMap.get(locator);
    }
    getPolicyCharacteristics(locator)
    {
        if (!this.#policyCharsMap)
        {
            this.#policyCharsMap =
                this.#policy
                    .characteristics
                    .toMap(ch => ch.locator);
        }
        return this.#policyCharsMap.get(locator);
    }
    getExposureCharacteristics(locator)
    {
        if (!this.#exposureCharsMap)
        {
            this.#exposureCharsMap =
                this.allExposureCharacteristics()
                    .toMap(ch => ch.locator);
        }
        return this.#exposureCharsMap.get(locator);
    }
    getPerilCharacteristics(locator)
    {
        if (!this.#perilCharsMap)
        {
            this.#perilCharsMap = this.allPerilCharacteristics()
                                      .toMap(x => x.locator);
        }
        return this.#perilCharsMap.get(locator);
    }
    allExposureCharacteristics()
    {
        if (!this.#allExposureCharacteristics)
        {
            this.#allExposureCharacteristics =
                this.#allExposureCharacteristics ||
                this.#policy
                    .exposures
                    .flatMap(ex => ex.characteristics);
        }
        return this.#allExposureCharacteristics;
    }
    allPerils()
    {
        if (!this.#allPerils)
        {
            this.#allPerils =
                this.#policy
                    .exposures
                    .flatMap(ex => ex.perils);
        }
        return this.#allPerils;
    }
    allPerilCharacteristics()
    {
        if (!this.#allPerilCharacteristics)
        {
            this.#allPerilCharacteristics =
                this.#allPerilCharacteristics ||
                this.allPerils()
                    .flatMap(p => p.characteristics);
         }
        return this.#allPerilCharacteristics;
    }
    getFieldValue(chars, key)
    {
        const value = chars.fieldValues[key];
        return value === undefined ? undefined : value[0];
    }
    getFieldValueInt(chars, key)
    {
        const value = chars.fieldValues[key];
        return value === undefined ? undefined : parseInt(value[0]);
    }
    getFieldValueFloat(chars, key)
    {
        const value = chars.fieldValues[key];
        return value === undefined ? undefined : parseFloat(value[0]);
    }
    // Timestamps are sent to the plugin in raw string form. This
    // function will convert the timestamps on a characteristics
    // object to numeric form for manipulation, such as by the
    // DateCalc.js library.
    destringifyCharacteristicsTimestamps(chars)
    {
        chars.createdTimestamp = parseInt(chars.createdTimestamp);
        chars.updatedTimestamp = parseInt(chars.updatedTimestamp);
        if (chars.issuedTimestamp)
            chars.issuedTimestamp = parseInt(chars.issuedTimestamp);
        if (chars.replacedTimestamp)
            chars.replacedTimestamp = parseInt(chars.replacedTimestamp);
        if (chars.startTimestamp) // policy or exposure
        {
            chars.startTimestamp = parseInt(chars.startTimestamp);
            chars.endTimestamp = parseInt(chars.endTimestamp);
        }
        else // peril
        {
            chars.coverageStartTimestamp = parseInt(chars.coverageStartTimestamp);
            chars.coverageEndTimestamp = parseInt(chars.coverageEndTimestamp);
        }
    }
    // Field values can be compared by serializing them all to JSON
    // and comparing the strings. We just save the string on the
    // same object for convenience.
    // This depends on the field keys being in the same order.
    getFieldValuesJson(fv)
    {
        return fv.json ||
               (fv.json = JSON.stringify(fv));
    }
}
exports.PolicyContext = PolicyContext;