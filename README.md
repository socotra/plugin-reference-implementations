# Socotra Plugin Reference Implementations

## How to use this repository

This repository consists of plugin reference implementations and associated tests. Some plugins, such as the payments plugin (aka "installments"), offer standard options that make it possible to adopt the reference implementation as-is in your deployment. Others are so dependent upon product configuration that the reference implementation should be seen more as an example than a ready-to-use implementation.

Subsequent releases will reflect our aim to parameterize as much plugin behavior as possible so that plugin deployments follow this general pattern:

1. Gather your requirements
2. Tweak reference plugin options to reflect those requirements
3. Deploy reference plugins with your options

We recommend that adjustments to reference plugins be accomplished through one of two patterns:
1. Inheritance and overrides
2. Wrappers

In either case, the idea is to ease maintenance burdens by making it easier to see what version of an underlying reference implementation is deployed, and how any customizations differ from the reference. These patterns also make it easier to adopt any updates to underlying reference implementations in a simple, stable way.

## FAQ

### Do I need to build the reference plugins?

No - plugins are designed to be "grab and go"; you can use them immediately by simply copying the `scripts` directory into a configuration, and enabling the plugins in the plugin stanza in the applicable product `policy.json`. Here is the stanza for the complete plugin set:

```
  "plugins": {
    "getUnderwritingResult": {
      "path": "main/underwriter.js",
      "enabled": true
    },
    "getPerilRates": {
      "path": "main/rater.js",
      "enabled": true
    },
    "createInstallments": {
      "path": "main/installments.js",
      "enabled": true
    },
    "getProrationResult": {
      "path": "main/prorater.js",
      "enabled": true
    },
    "getPostPaymentReversal": {
      "path": "main/postPaymentReversal.js",
      "enabled": true
    },
    "getPostIssuanceResult": {
      "path": "main/postIssuance.js",
      "enabled": true
    },
    "getPreGraceResult": {
      "path": "main/preGrace.js",
      "enabled": true
    },
    "getDataAutofill": {
      "path": "main/dataAutofill.js",
      "enabled": true
    }
  }
```

Note that the lambda plugin is not included, since it is automatically enabled if it is present in `scripts/lambda/lambda.js`.

### How do I run tests?

First, install the dev dependencies: `npm install`

Tests use the `jest` framework and can be run with `npm test` from the base directory. You can also use take advantage of `jest`'s [pattern matching](https://jestjs.io/docs/cli); for example, to run tests in all files for installments, just can just run `npm test insta`.

### Do I have to run tests?

No, but we highly recommend it. Tests serve as clear statements of expected behavior against representative sample data, help to avoid regressions, and assist greatly in troubleshooting. A practical test-first approach to plugin development generally looks like this:
1. Determine your requirements
2. Obtain sample plugin input data for the scenarios you envision
3. Write tests that assert the behavior you expect against your plugin implementation's outputs for the sample data
4. Update your plugin code until the tests pass
5. Deploy with confidence!

### How do I write tests against plugins that use socotraApi?

You can use mocks in order to make these work within a testing context. Check out `test-helpers.js` for some convenience functions, such as `mockApi`, which you can use in tests like this:

```
require('../test-helpers.js').createMockApi({
    tableInfo: [{
        tableName: "vehicle_rate_table_personal_auto",
        tableData: "key,value\nCar,1\nSport Utility,1.2\nMotorcycle,1.65\nPickup Truck,1.35"
    }]
});
```

You can also make simple global mocks like this:

``` 
global.socotraApi.setAuxData = x => x;
```
