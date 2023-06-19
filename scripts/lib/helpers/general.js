/* global socotraApi */

/**
 * THE FOLLOWING ARE VERY SIMPLE CONVENIENCE FUNCTIONS
 */

/**
 * Returns first value if "list" has length, otherwise return list
 *
 * @param {*} list
 * @param {*} obj
 * @param {*} onnull
 * @returns
 */
function firstIfLength(list, obj = true, onnull = null) {
  if (list instanceof Array) {
    return list.length ? list[0] : obj ? list : onnull;
  }
  return obj ? list : onnull;
}

/**
 * Converts a camelCase string to dashed string
 *
 * @param {string} input camelCase string
 * @returns {string} Dashed string
 */
function camelDash(input) {
  return input.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

/**
 * Converts standard string to camelCase
 *
 * @param {string} input standars string
 * @returns {string}
 */
function camelize(input) {
  return input.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/**
 * Turns a boolean into a mapped value (e.g. "Y" or "N")
 *
 * @param {string} input
 * @param {array} boolMap
 * @returns {*}
 */
function makeBoolKey(input, boolMap = ["Y", "N"]) {
  if (input == true) {
    return boolMap[0];
  }
  return boolMap[1];
}

/**
 * Will lowercase a string, if it's a string.
 *
 * @param {*} input
 * @param {*} caseInsensitive
 * @returns {*}
 */
function makeSimilar(input, caseInsensitive = true) {
  if (typeof input == "string" && caseInsensitive) {
    return input.toLowerCase();
  }
  return input;
}

/**
 * Finds a value in a map or returns a default, if applicable.
 *
 * @param {string} input
 * @param {dict} inMap
 * @param {boolean} caseInsensitive
 * @param {*} noKey
 * @returns {*}
 */
function getValue(input, inMap, caseInsensitive = true, noKey = false) {
  input = makeSimilar(input, caseInsensitive);
  for (const [key, value] of Object.entries(inMap)) {
    if (input == makeSimilar(key, caseInsensitive)) {
      return value;
    }
  }
  if ("_default" in inMap) {
    return inMap["_default"];
  }
  return noKey;
}

/**
 * Determines if key exists in a list of values.
 *
 * @param {string} key
 * @param {array} values
 * @param {boolean} caseInsensitive
 * @returns {boolean}
 */
function isAnyOf(key, values, caseInsensitive = true) {
  values = Array.isArray(values) ? values : [values];
  key = makeSimilar(key, caseInsensitive);
  const matches = values.filter(function (value) {
    value = makeSimilar(value, caseInsensitive);
    if (value == key) {
      return true;
    }
  });
  if (matches.length >= 1) {
    return true;
  }
  return false;
}

/**
 * Round a number down to the closest of a given increment.
 *
 * @param {float} num
 * @param {integer} inc
 * @returns {float}
 */
function floorByIncrement(num, inc) {
  return Math.floor(num / inc) * inc;
}

/**
 * Round a number up to the closest of a given increment.
 *
 * @param {float} num
 * @param {integer} inc
 * @param {float} otherwise
 * @returns {float}
 */
function ceilByIncrement(num, inc, otherwise = 0) {
  return (Math.ceil(num / inc) * inc) | otherwise;
}

/**
 * Determine complete months between two dates.
 *
 * @param {date} dateA
 * @param {date} dateB
 * @returns {integer}
 */
function fullMonthsBetween(dateA, dateB) {
  let months = (dateB.getFullYear() - dateA.getFullYear()) * 12;
  months -= dateA.getMonth();
  months += dateB.getMonth();
  return months <= 0 ? 0 : months;
}

/**
 * THE FOLLOWING ARE VERY SOCOTRA SPECIFIC HELPERS
 */

/**
 * Performs lookup a second time for DEFAULT value if first value is blank.
 *
 * @param {string} table The Socotra CSV table.
 * @param {string} key The needle we look for in the key row.
 * @param {boolean} clean Whether to remove alphabetic characters.
 * @param {float|string} onblank Default value when first lookup is blank.
 * @return {float|string} The processed value we looked up.
 */
function lookupNumeric(
  table,
  key,
  clean = true,
  onblank = "",
  fallback = true
) {
  key = clean ? key.replace(/[a-zA-Z]/g, "") : key;
  let lookupValue = socotraApi.tableLookup(0, table, key);
  if (lookupValue == "" && fallback) {
    lookupValue = socotraApi.tableLookup(0, table, "DEFAULT");
  }
  return lookupValue == "" ? onblank : parseFloat(lookupValue);
}

function bandedCalc(table, amount, inc = 5000) {
  let banded = floorByIncrement(amount, inc);
  let nearestBandMax = lookupNumeric(
    `${table.toLowerCase()}-bmax-rate`,
    banded,
    false
  );
  let additionalToRate = amount - banded;
  let additionalRate = lookupNumeric(
    `${table.toLowerCase()}-bmax-multip`,
    banded,
    false
  );
  return nearestBandMax + additionalToRate * additionalRate;
}

function getRateDurationFactor(dateCalc) {
  let rateDurationFactor;
  switch (dateCalc.getDurationUnit()) {
    case "months":
      rateDurationFactor = 1 / 12;
      break;
    case "days360":
      rateDurationFactor = 1 / 360;
      break;
    case "days365":
      rateDurationFactor = 1 / 365;
      break;
    case "days":
    case "wholeDays":
      rateDurationFactor = 1 / 365;
      break;
    case "ms":
      rateDurationFactor = 1 / (365 * 24 * 60 * 60 * 1000);
      break;
    default:
      throw `rater.js: Duration unit ${dateCalc.getDurationUnit()} not supported.`;
  }
  return rateDurationFactor;
}

/**
 * THE FOLLOWING ARE LOOSELY SOCOTRA SPECIFIC HELPERS
 */

function extractValue(key, dict, onnull = null, str = true, rmsp = true) {
  if (!(key in dict) || dict[key] === null) {
    if (onnull === null) {
      throw Error(`Field value for '${key}' is required for rating`);
    } else {
      return onnull;
    }
  } else {
    let value = dict[key];
    value = str ? String(value) : value;
    if (typeof value === "string") {
      value = typeof value === "string" ? value.toString() : value;
      value = rmsp ? value.replace(/\s/g, "") : value;
    }
    return value;
  }
}

function getGroupEntriesByLocator(char, itemLocators, onnull = null) {
  let entries = [];
  for (const locator of itemLocators) {
    let cleanItem = {};
    if (locator in char.fieldGroupsByLocator) {
      const item = char.fieldGroupsByLocator[locator];
      const itemKeys = Object.keys(char.fieldGroupsByLocator[locator]);
      for (const key of itemKeys) {
        cleanItem[key] = extractValue(key, item, onnull, true, false);
      }
      entries.push(cleanItem);
    }
  }
  return entries;
}

function getGroupEntriesByName(char, groupField, onnull = null) {
  const itemLocators = extractValue(groupField, char.fieldValues, [], false);
  return getGroupEntriesByLocator(char, itemLocators, onnull);
}

/**
 * Turns characteristic into key, value dict with fields and some metadata on the same level.
 */
function flattenChar(char) {
  let newChar = {};
  let groupFields = [];
  const keepIfAvailable = [
    "locator",
    "productLocator",
    "startTimestamp",
    "endTimestamp",
    "updatedTimestamp",
  ];
  // Add fieldValues and fill group fields.
  for (const [fieldName, fieldValue] of Object.entries(char.fieldValues)) {
    // Determine if fieldValue references a fieldGroup.
    const groupResult = getGroupEntriesByLocator(char, fieldValue);
    if (groupResult.length) {
      groupFields.push(fieldName);
      newChar[fieldName] = groupResult;
    } else {
      newChar[fieldName] = firstIfLength(fieldValue);
    }
  }
  // Add stock fields, if available.
  for (const stockField of keepIfAvailable) {
    if (stockField in char) {
      newChar[stockField] = char[stockField];
    }
  }
  return newChar;
}

/**
 * Groups data by value and allows summing of others.
 *
 * @param {dict} data
 * @param {string} field
 * @param {array} sum
 * @param {array} extra
 * @returns {dict}
 */
function pivot(data, field, sum = [], extra = []) {
  sum = Array.isArray(sum) ? sum : [sum];
  extra = Array.isArray(extra) ? extra : [extra];
  return data.reduce((prev, cur) => {
    let existing = prev.find((x) => x[field] === cur[field]);

    if (existing) {
      if (sum.length) {
        for (const sumItem of sum) {
          if (sumItem) {
            existing[
              `sum${sumItem.charAt(0).toUpperCase()}${sumItem.slice(1)}`
            ] += sumItem in cur ? parseFloat(cur[sumItem]) : 0;
          }
        }
      }
      existing.values.push(cur);
    } else {
      let entry = {};
      entry[field] = cur[field];
      entry["values"] = [cur];
      if (sum.length) {
        for (const sumItem of sum) {
          if (sumItem) {
            entry[`sum${sumItem.charAt(0).toUpperCase()}${sumItem.slice(1)}`] =
              sumItem in cur ? parseFloat(cur[sumItem]) : 0;
          }
        }
      }
      if (extra.length) {
        for (const extraItem of extra) {
          if (extraItem) {
            entry[extraItem] = extraItem in cur ? cur[extraItem] : "";
          }
        }
      }
      prev.push(entry);
    }

    return prev;
  }, []);
}

module.exports = {
  durationCalcMethod: (paymentScheduleName) =>
    paymentScheduleName === "weekly" ? "wholeDays" : "months",
  lookupNumeric,
  extractValue,
  firstIfLength,
  camelDash,
  isAnyOf,
  makeBoolKey,
  makeSimilar,
  getRateDurationFactor,
  getGroupEntriesByName,
  getGroupEntriesByLocator,
  flattenChar,
  floorByIncrement,
  fullMonthsBetween,
  ceilByIncrement,
  camelize,
  pivot,
  bandedCalc,
};
