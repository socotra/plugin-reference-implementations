## 1.3

### Features
* Partial payments implementation wrapper now recognizes "overpay credit" option to apply overpay amounts to subsequent invoices
* Example of `mock-api` in `mock-api-example.test.js`

### Fixes
* Added missing `arrays.js` import to `test-helpers.js`

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
