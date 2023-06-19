class BetterLookup {
  constructor(tablesPath="../tables", tablesFile="processed-tables.js") {
    this.tablesPath = tablesPath;
    this.tablesFile = tablesFile;

    // Set some commons reduce types.
    this.reduceTypes = {
      "findNeedle": function(table, elements={}) {
        console.log("Reducing rows where lookup is needle", elements);
        return table.filter(function(el) {
          return el[elements.lookup] == elements.needle
        });
      },
      "findNeedleInRange": function(table, elements={}) {
        console.log("Reducing rows where needle is in range", elements);
        const filteredData = table;
        let found = [];
        for(const entry of filteredData) {
          let [start, end] = [null, null];
          const separators = ['...', '-'];
          for(const seperator of separators) {
            let lookupParts = entry[elements.lookup].split(seperator);
            if(lookupParts.length == 2) {
              [start, end] = [lookupParts[0], lookupParts[1]];
              break
            }
          }
          if(
            (start != null && end != null) &&
            parseInt(elements.needle) >= parseInt(start) &&
            parseInt(elements.needle) <= parseInt(end)
          ) {
            found.push(entry);
          }
        }
        return found;
      },
      /**
       * Works similar to Excel VLOOKUP last param TRUE.
       * Expects keys to be in incremental order.
       */
      "findClosestNeedle": function(table, elements={}) {
        let found = [];
        const tableLength = table.length;
        let previousEntry = tableLength ? table[0] : null;
        for(const [key, entry] of Object.entries(table)) {
          if(entry[elements.lookup]) {
            if(parseFloat(elements.needle) < parseFloat(entry[elements.lookup])) {
              found.push(previousEntry);
              break;
            }
            if(key == tableLength-1) {
              found.push(entry);
              break;
            }
            previousEntry = entry;
          }
        }
        return found;
      }
    }
    // Set some common extractTypes.
    this.extractTypes = {
      "singleColumn": function(table, elements={}) {
        console.log("Extracting single column from row(s)", elements);
        if(elements.extract) {
          return table.map(function(el) {
            return el[elements.extract]
          });
        }
      },
      "singleResult": function(table, elements={}) {
        console.log("Extracting single row from table, of only one", elements);
        if(table.length == 0) {
          return undefined;
        } else if(table.length <= 1) {
          return table[0];
        } else {
          return table;
        }
      }
    }
  }

  registerReduceType(name, logic) {
    this.reduceTypes[name] = logic;
  }

  registerExtractType(name, logic) {
    this.extractTypes[name] = logic;
  }

  loadTable(tableName) {
    tableName = tableName.replaceAll('/', '--');
    let tables = require(`${this.tablesPath}/${this.tablesFile}`);
    return tables[tableName];
  }

  tableLookup(table, needle, extract="value", lookup="key", reducer=false, extractor=false) {
    // Set defaults
    let reducers = reducer ? reducer : "findNeedle";
    let extractors = extractor ? extractor : "singleColumn";
    // Wrap in list
    reducers = Array.isArray(reducers) ? reducers : [reducers];
    extractors = Array.isArray(extractors) ? extractors : [extractors];
  
    let reduced = table;
    for(let reducer of reducers) {
      if(reducer[0] == "<" && reduced.length == 0) {
        console.log("Prior reducer yeilded zero results, resetting table and continuing.");
        // Didn't find anything, reset the result set.
        reducer = reducer.substring(1);
        reduced = table;
      } else if(reducer[0] == "<" && reduced.length > 0) {
        // Don't invoke any further reducers if we have a result.
        break;
      }
      reduced = this.reduceTypes[reducer](reduced,
        { "extract": extract, "needle": needle, "lookup": lookup }
      );
    }
    let extracted = reduced;
    for(const extracter of extractors) {
      extracted = this.extractTypes[extracter](extracted,
        { "extract": extract, "needle": needle, "lookup": lookup }
      );
    }
    return extracted;
  }

  // Wrapper to lookup CSV.
  lookupCSV(tableName, needle, extract="value", lookup="key", handling={}) {
    console.log(`Hydrating table for lookup: "${tableName}"`);
    let table = this.loadTable(tableName);
  
    const result = this.tableLookup(
      table,
      needle,
      extract ? extract : "value",
      lookup ? lookup : "lookup",
      "reduce" in handling ? handling["reduce"] : false,
      "extract" in handling ? handling["extract"] : false,
    )
  
    if((result == [] || result == "" || result == undefined) && "default" in handling) {
      return handling["default"];
    }
    return result;
  }
}

module.exports = BetterLookup;