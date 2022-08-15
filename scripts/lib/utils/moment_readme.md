Moment Library
==============

* This will be used at least until we upgrade v8 to support time zone and daylight savings time operations natively
* Currently uses the moment timezone 1970-2030
* All files are as shipped by the moment project except `moment-timezone-with-data-1970-2030.min.js` has the statement `require("moment")` changed to `require("./moment.js")`:

    * https://momentjs.com/downloads/moment.js
    * https://momentjs.com/downloads/moment-timezone-with-data-1970-2030.js