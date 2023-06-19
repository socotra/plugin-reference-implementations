class PremiumModel {
  constructor(baseRate, processing=false) {
    this.baseRate = parseFloat(baseRate);
    this.currentPremium = parseFloat(baseRate);
    this.operations = [];

    // Allow for processing of figures at each step.
    this.rawProcess = processing;
    if(processing == false) {
      // If no processing (e.g. rounding), just return.
      this.rawProcess = function(value) {
        return parseFloat(value);
      }
    }
    // Set operation for processing.
    this.operations.push({
      "name": "setProcess",
      "effect": this.rawProcess.toString(),
      "premium": this.currentPremium,
      "description": "Process Function"
    });
    this.process = function(input, requested=false) {
      if(requested) {
        return this.rawProcess(...input, requested);        
      }
      return Array.isArray(input) ? input[0] : input;
    }
  }

  /**
   * Reduce premium by a given factor
   * @param {float} factor 
   * @param {string} description 
   * @param {boolean} process 
   */
  applyDiscount(factor, description, process=true) {
    const newPremium = this.process(
      [this.currentPremium - (this.currentPremium * factor)], process
    );
    const baseEffect = `${this.currentPremium} - (${this.currentPremium} * ${factor})`;
    this.operations.push(
      {
        "name": "applyDiscount",
        "effect": process ? `process(${baseEffect})` : baseEffect,
        "premium": newPremium,
        "description": description
      }
    )
    this.currentPremium = newPremium;
  }

  applyFactor(factor, description, process=true) {
    const newPremium = this.process(
      [(this.currentPremium * factor)], process
    );
    const baseEffect = `${this.currentPremium} * ${factor}`;
    this.operations.push(
      {
        "name": "applyFactor",
        "effect": process ? `process(${baseEffect})` : baseEffect,
        "premium": newPremium,
        "description": description
      }
    )
    this.currentPremium = newPremium;
  }

  /**
   * Add (or subtract) premium by a rate
   * @param {*} rate 
   * @param {*} description 
   * @param {*} process 
   */
  addRate(rate, description, process=true) {
    const invertedRate = (rate * -1);
    let invert = rate < 0 ? true : false;

    const newPremium = this.process(
      [this.currentPremium + rate], process
    );
    let baseEffect = (invert ?
      `${this.currentPremium} - ${invertedRate}` :
      `${this.currentPremium} + ${rate}`
    );
    this.operations.push(
      {
        "name": "addRate",
        "effect": process ? `process(${baseEffect})` : baseEffect,
        "premium": newPremium,
        "description": description
      }
    )
    this.currentPremium = newPremium;
  }

  readLog() {
    for(let [key, entry] of this.operations.entries()) {
      console.log(`Step ${key+1}: ${entry.description}`);
      console.log(`${entry.name}: ${entry.premium} = ${entry.effect}\n`);
    }
  }

  getPremium(process=true) {
    return this.process([this.currentPremium], process);
  }
}