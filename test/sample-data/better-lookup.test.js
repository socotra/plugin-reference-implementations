const BetterLookup = require('../../scripts/lib/helpers/BetterLookup.js');

const path = require('path');

// Define a custom function to reduce.
function withinYear(table, elements={}) {
  console.log("Finding within year", elements);
  const validValues = [
    parseInt(elements.needle)-1,
    parseInt(elements.needle),
    parseInt(elements.needle)+1
  ];
  console.log(validValues);
  console.log(table);
  return table.filter(function(el) {
    console.log(el);
    return (validValues.includes(parseInt(el[elements.lookup])))
  });
}

describe('better lookup with custom function', () => {
    it('should return expected values', () => {
        let sampleLookup = new BetterLookup(__dirname, "betterLookupSampleTable.js");

        // Regsiter our reducer for use.
        sampleLookup.registerReduceType("withinYear", withinYear);

        // The default functionality is to return the extract column.
        // If we want the whole entry we and set extract to [].
        const simpleCase = sampleLookup.lookupCSV(
          "sciFiReleases", "1994", "property", "year",
          {
            reduce: ["withinYear"],
            extract: []
          }
        );

        expect(simpleCase).toHaveLength(3);
        console.log("Simple Case:", simpleCase, "\n");
    });
});