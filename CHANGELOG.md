## 1.6
### Features
* New leveling method 'first' places odd cents on first installment in leveled range

### Fixes
* Addressed bug in 'last' leveling method that could cause validation failure

## 1.5

### Features
* New leveling method 'last' places odd cents on last installment in a leveled range

### Fixes
* Addressed bug in 'writeOff' leveling method preventing creation of writeoff invoice

## 1.4

### Features
* Partial payments implementation wrapper now recognizes "overpay credit" option to apply overpay amounts to subsequent invoices
* Example of `mock-api` in `mock-api-example.test.js`

### Fixes
* Added missing `arrays.js` import to `test-helpers.js`

## 1.3

### Fixes
* Prevent weighted first installment from being subject to shortfall adjustments

## 1.2

### Chore & Maintenance
* Illustrative tests for partial (aka "mismatched") payment installment plugin
* Additional ratio methods in `dateCalc`

## 1.1

### Chore & Maintenance
* Moved main plugin tests under respective components
* Set fixed timestamp on partial payment test

## 1.0

### Features
* Full suite of sample or configurable plugins for Socotra platform
* Assertion tests with `jest`

### Fixes
* Payment schedule plugin: handling for "overcharge" scenarios and generation of zero-due invoices on endorsement issuance

### Chore & Maintenance
* Adopted new JavaScript features enabled by v8 engine upgrade
