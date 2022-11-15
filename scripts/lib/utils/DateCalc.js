require("./moment-timezone-with-data-1970-2030.js");
const moment = require("./moment.js");

/**
 *    General utility class for manipulating timestamps based on their actual
 *    time-zone aware values for dates.
 *
 *    The functions getTimestamp and getDateInfo use 1-based months, so
 *    January = 1, February = 2, etc., unlike javascript's zero-based months.
 *
 *    This class uses moment.js and moment timezone but doesn't expose moments
 *    outside of the private functions. After we upgrade v8 we can replace moment
 *    calcs with something better (luxon, perhaps)
 *
 *    When calculating durations the result from getDuration is in time units, as
 *    passed to the constructor. Valid time units are:
 *
 *     - months
 *     - days
 *     - wholeDays
 *     - days360 (using a 30E/360 calendar)
 *     - ms (milliseconds)
 *
 *    Note: `socotraMonths` and `days365` are not supported; use them only for
 *    testing.
 */
class DateCalc {
    #anchorTimestamp;
    #timeZone;
    #durationUnit;
    #getDuration;
    #useAnchorForDurationCalc;

    constructor(timeZone = 'UTC', anchorTimestamp = null, durationUnit = null) {
        this.#timeZone = timeZone;
        this.#setDurationUnit(durationUnit);
        this.#anchorTimestamp = anchorTimestamp;
    }

    getDurationUnit() { return this.#durationUnit; }

    #setDurationUnit(durationUnit) {
        if (durationUnit && typeof durationUnit === 'object') {
            this.#getDuration = durationUnit.durationFn;
            this.#durationUnit = durationUnit.durationUnitName;
            this.#useAnchorForDurationCalc = !!durationUnit.useAnchorForDurationCalc;
            this.#moveAnchorTimestampEarlier = durationUnit.moveAnchorTimestampEarlier;
        } else {
            this.#durationUnit = durationUnit || 'months';
            switch (this.#durationUnit) {
                case 'days360':
                    this.#getDuration = this.dayCount360;
                    this.#useAnchorForDurationCalc = false;
                    break;
                case 'days365':
                    this.#getDuration = this.dayCount365;
                    this.#useAnchorForDurationCalc = true;
                    break;
                case 'months':
                    this.#getDuration = this.monthCount;
                    this.#useAnchorForDurationCalc = true;
                    break;
                case 'socotraMonths':
                    this.#getDuration = this.socotraMonthCount;
                    this.#useAnchorForDurationCalc = true;
                    break;
                case 'days':
                    this.#getDuration = this.dayCount;
                    this.#useAnchorForDurationCalc = false;
                    break;
                case 'wholeDays':
                    this.#getDuration = this.dayCountWhole;
                    this.#useAnchorForDurationCalc = false;
                    break;
                case 'ms':
                    this.#getDuration = (start, end) => end - start;
                    this.#useAnchorForDurationCalc = false;
                    break;
                default:
                    throw `Duration unit ${durationUnit} not supported!`;
            }
        }
    }

    #moveAnchorTimestampEarlier(timestamp) {
        /**
         * Date calcs for anchor-timestamp based units only are valid when the
         * anchor timestamp is before the reference timestamp. If trying to use
         * a reference timestamp that's before the anchor, adjust the anchor earlier
         * in a compatible way.
         */
        if (timestamp < this.#anchorTimestamp) {
            let moment = this.#toMoment(this.#anchorTimestamp);
            switch (this.#durationUnit) {
                case 'months':
                case 'socotraMonths':
                    while (moment.valueOf() > timestamp) {
                        moment.add(-1, 'months');
                    }
                    this.#anchorTimestamp = moment.valueOf();
                    break;
                default:
                    throw `Duration unit for base adjust ${this.#durationUnit} not supported.`;
            }
        }
    }
    /* one based months */
    getTimestamp(year = 1970, month = 1, day = 1, hour = 0,
                 minute = 0, second = 0, millisecond = 0)
    {
        if (month < 1 || month > 12) {
            throw `getTimestamp: month ${month} out of range. Use 1-based month values.`;
        }

        return moment.tz( { year, month: month - 1, day, hour, minute, second, millisecond}, this.#timeZone).valueOf();
    }
     /* one based months */
    getDateInfo(timestamp) {
        const m = this.#toMoment(timestamp);
        return {
            year: m.year(),
            month: m.month() + 1,
            day: m.date(),
            hour: m.hour(),
            minute: m.minute(),
            second: m.second(),
            millisecond: m.millisecond()
        }
    }

    isDateInfoSame(info1, info2) {
        return info1.year === info2.year &&
               info1.month === info2.month &&
               info1.day === info2.day &&
               info1.hour === info2.hour &&
               info1.minute === info2.minute &&
               info1.second === info2.second &&
               info1.millisecond === info2.millisecond;
    }

    formatTimestamp(timestamp) {
        const di = this.getDateInfo(timestamp);
        return `${di.year}-${this.#leadZero(di.month)}-${this.#leadZero(di.day)} ${this.#leadZero(di.hour)}:${this.#leadZero(di.minute)}:${this.#leadZero(di.second)}`;
    }

    formatTimestampDate(timestamp) {
        const di = this.getDateInfo(timestamp);
        return `${di.year}-${this.#leadZero(di.month)}-${this.#leadZero(di.day)}`;
    }

    #leadZero(num) {
        return ("00" + num.toString()).slice(-2);
    }

    /**
     *
     * @param startTimestamp inclusive lower bound of sequence
     * @param endTimestamp exclusive upper bound of sequence
     * @param options
     *  increment: 'month', 'week', 'quarter', etc. Default is 'month'
     *              increment can be an array of integers representing day offsets. If this is used,
     *              the anchorTimestamp must be the same as the startTimestamp.
     *  anchorTimestamp: ensure the sequence includes this timestamp. Default is startTimestamp. This will
     *                   be filtered out if it is outside of [start, end). Default is startTimestamp.
     *  maxCount: the maximum number of sequence items to return. Default is unlimited.
     *  returnMetadata: include information about the bounds of the sequence. Default is true
     *  returnIntervals: instead of a list of timestamps, return a list of { startTimestamp, endTimestamp }.
     *                   Default is true
     *
     * @returns {{sequence: *[], endCursor: Object, startCursor: Object}|*[]}
     */
    getDateSequence(startTimestamp, endTimestamp, options = null)
    {
        // Can just pass the increment instead of an options object
        let increment = (typeof options === 'string') ? options : (options.increment || 'month');
        const anchorTimestamp = options.anchorTimestamp || startTimestamp;
        const maxCount = (increment === 'eon') ? 1 : (options.maxCount || 100000000);
        const returnMetadata = options.returnMetadata !== false;
        const returnIntervals = options.returnIntervals !== false;

        const cursor = this.#toMoment(anchorTimestamp);

        const baseDay = cursor.date();
        let sequence = [];

        let incrementArray;

        if (startTimestamp >= endTimestamp) {
            throw "startTimestamp must be before endTimestamp";
        }

        if (Array.isArray(increment)) {
            if (startTimestamp !== anchorTimestamp) {
                throw "Must have startTimestamp equal anchorTimestamp when using day arrays.";
            }

            incrementArray = increment;
            increment = 'arrayDays';
        }

        else if (increment === 'eon') {
            if (startTimestamp !== anchorTimestamp) {
                throw "Must have startTimestamp equal anchorTimestamp when using eon interval";
            }
        }

        else {
            while (startTimestamp < cursor.valueOf()) {
                switch (increment) {
                    case '30day':
                        cursor.add(-30, 'days');
                        break;
                    case 'month':
                        this.#incrementMomentByMonth(cursor, baseDay, -1);
                        break;
                    case 'quarter':
                        this.#incrementMomentByMonth(cursor, baseDay, -3);
                        break;
                    case 'halfYear':
                        this.#incrementMomentByMonth(cursor, baseDay, -6);
                        break;
                    case 'year':
                        cursor.add(-1, 'years');
                        break;
                    case 'week':
                        cursor.add(-7, 'days');
                        break;
                    case '2week':
                        cursor.add(-14, 'days');
                        break;
                    default:
                        throw `Span increment '${increment}' not supported!`;
                }
            }
        }

        const startCursor = cursor.valueOf();
        let i = 0;
        let count = 0;
        while (cursor.valueOf() < endTimestamp) {
            if (cursor.valueOf() >= startTimestamp) {
                sequence.push(cursor.valueOf());
                count++;
            }

            switch (increment) {
                case 'eon':
                    break;
                case '30day':
                    cursor.add(30, 'days');
                    break;
                case 'month':
                    this.#incrementMomentByMonth(cursor, baseDay);
                    break;
                case 'quarter':
                    this.#incrementMomentByMonth(cursor, baseDay, 3);
                    break;
                case 'halfYear':
                    this.#incrementMomentByMonth(cursor, baseDay, 6);
                    break;
                case 'year':
                    cursor.add(1, 'years');
                    break;
                case 'week':
                    cursor.add(7, 'days');
                    break;
                case '2week':
                    cursor.add(14, 'days');
                    break;
                case 'arrayDays':
                    if (i < incrementArray.length)
                        cursor.add(incrementArray[i++], 'days');
                    else
                        cursor.add(incrementArray[incrementArray.length - 1], 'days');
                    break;
                default:
                    throw `Span increment '${increment}' not supported!`;
            }
            if (count >= maxCount) {
                break;
            }
        }

        if (sequence[0] !== startTimestamp) {
            sequence.unshift(startTimestamp);
        }

        if (returnIntervals) {
            sequence = sequence.map(x => ({ startTimestamp: x }));
            for (let i = 1; i < sequence.length; i++) {
                sequence[i - 1].endTimestamp = sequence[i].startTimestamp;
            }
            sequence[sequence.length - 1].endTimestamp = endTimestamp;
        }
        if (returnMetadata) {
            return {sequence, startCursor, endCursor: cursor.valueOf()};
        }
        else {
            return sequence;
        }
    }

    /**
     * Return a series of timestamps from start to end incrementing using the increment key
     *  Can also pass an array of day offsets like [60, 30]. If offsets run out, the last
     *  will be repeated as needed.
     * Deprecated: Use getDateSequence instead.
     * @param startTimestamp
     * @param endTimestamp
     * @param increment
     * @param maxCount
     * @returns {{sequence: *[], endCursor: Object, startCursor: Object}|*[]}
     */
    getDateSpan(startTimestamp, endTimestamp, increment = 'month', maxCount = 1000000) {
        return this.getDateSequence(startTimestamp, endTimestamp,
            { increment, maxCount, returnIntervals: false, returnMetadata: false });
    }

    addToTimestamp(timestamp, count, increment = 'days') {
        return this.#toMoment(timestamp).add(count, increment)
                                        .valueOf();
    }

    getEndOfDayTimestamp(timestamp) {
        return this.#toMoment(timestamp).endOf('day')
                                        .valueOf();
    }

    dayCount(startTimestamp, endTimestamp) {
        const startM = this.#toMoment(startTimestamp);
        const endM = this.#toMoment(endTimestamp);

        return endM.diff(startM, 'days', true);
    }

    dayCountWhole(startTimestamp, endTimestamp) {
        const startM = this.#toMoment(startTimestamp);
        const endM = this.#toMoment(endTimestamp);

        return endM.diff(startM, 'days');
    }

    #getRatioCalculation(startTimestamp, splitTimestamp, endTimestamp, getRatioFn, clampZeroToOne = true) {
        if (startTimestamp >= endTimestamp) {
            throw "Duration Ratio: Denominator cannot be zero or negative.";
        }

        if (splitTimestamp > endTimestamp) {
            throw "Duration Ratio: Split cannot be after end.";
        }

        if (splitTimestamp <= startTimestamp) {
            return 0;
        }

        let result = getRatioFn();

        if (clampZeroToOne) {
            result = Math.max(0, Math.min(1, result));
        }

        return result;
    }

    linearRatio(startTimestamp, splitTimestamp, endTimestamp, clampZeroToOne = true) {
        return this.#getRatioCalculation(startTimestamp, splitTimestamp, endTimestamp,
            () => (splitTimestamp - startTimestamp) / (endTimestamp - startTimestamp), clampZeroToOne);
    }

    dayCountRatio(startTimestamp, splitTimestamp, endTimestamp, clampZeroToOne = true) {
        return this.#getRatioCalculation(startTimestamp, splitTimestamp, endTimestamp,
            () => this.dayCount(startTimestamp, splitTimestamp) / this.dayCount(startTimestamp, endTimestamp),
            clampZeroToOne);
    }

    socotraMonthCountRatio(startTimestamp, splitTimestamp, endTimestamp, clampZeroToOne = true) {
        return this.#getRatioCalculation(startTimestamp, splitTimestamp, endTimestamp,
            () => this.socotraMonthCount(startTimestamp, splitTimestamp) / this.socotraMonthCount(
                startTimestamp, endTimestamp),
            clampZeroToOne);
    }

    incrementMonth(startTimestamp, numMonths = 1) {
        return this.#toMoment(startTimestamp).add(numMonths, 'months').valueOf();
    }

    monthCount(startTimestamp, endTimestamp) {
        let curM = this.#toMoment(startTimestamp);

        let startDayOfMonth;

        if (this.#anchorTimestamp) {
            startDayOfMonth = this.#toMoment(this.#anchorTimestamp).date();
        } else {
            startDayOfMonth = curM.date();
        }

        if (startDayOfMonth < 29) {
            startDayOfMonth = null;
        }

        let months = 0;
        // A little over 366 days. There will be *at least* yearsGap years between
        // start and end, so count several years at once.
        const yearsGap = Math.floor((endTimestamp - startTimestamp) / 31626720000);

        if (yearsGap) {
            curM.add(yearsGap, 'years');
            months = yearsGap * 12;
        }

        while (curM.valueOf() < endTimestamp) {
            const nextM = this.#incrementMomentByMonth(curM.clone(), startDayOfMonth, 1);

            if (nextM.valueOf() > endTimestamp)
                months += (endTimestamp - curM.valueOf()) / (nextM.valueOf() - curM.valueOf());
            else
                months++;
            curM = nextM;
        }

        return months;
    }

    /**
     * Intended to duplicate the Socotra platform month count algorithm
     */
    socotraMonthCount(startTimestamp, endTimestamp) {
        const baseTimestamp = this.#anchorTimestamp || startTimestamp;

        const startM = this.#toMoment(startTimestamp);
        const endM = this.#toMoment(endTimestamp);
        const baseM = this.#toMoment(baseTimestamp);

        const startDate = startM.date();
        const endDate = endM.date();

        // Simple case
        if ((baseTimestamp <= startTimestamp) && (startTimestamp < endTimestamp)
            && (startDate === endDate) && (startM.hour() === endM.hour())
            && ((startTimestamp % 3600000) === (endTimestamp % 3600000))) {
            const differenceInYears = endM.year() - startM.year();
            const differenceInMonths = endM.month() - startM.month();
            return differenceInMonths + differenceInYears * 12;
        }

        // Normal case
        const baseDate = baseM.date();

        let monthCount = 0;
        let prevMonth = startM.clone();
        let monthCursor = this.#socotraIncrementMomentByMonth(startM, baseDate);

        while (monthCursor.valueOf() < endTimestamp) {
            prevMonth = monthCursor;
            monthCursor = this.#socotraIncrementMomentByMonth(monthCursor, baseDate);
            monthCount += 1;
            if (monthCursor.date() !== startDate) {
                const daysInMonth = monthCursor.daysInMonth();

                // special case for policies that started on 29/30/31
                if (baseDate >= daysInMonth) {
                    monthCursor.set('date', daysInMonth);
                } else {
                    monthCursor.set('date', Math.min(startDate, daysInMonth));
                }
            }
        }

        const prevMonthVal = prevMonth.valueOf();
        if (prevMonthVal === endTimestamp) {
            return monthCount;
        } else {
            const remainder = endTimestamp - prevMonthVal;
            const totalNextMonthMillis = monthCursor.valueOf() - prevMonthVal;
            return this.#round7(monthCount + remainder / totalNextMonthMillis);
        }
    }

    targetAmountToSocotraYearlyRate(startTimestamp, endTimestamp, targetAmount)
    {
        const months = this.socotraMonthCount(startTimestamp, endTimestamp);
        return targetAmount / months * 12;
    }

    /**
     * Computes the duration based on the units specified with the class'
     * durationUnit.
     * @param startTimestamp
     * @param endTimestamp
     * @returns {number|*}
     */
    getDuration(startTimestamp, endTimestamp) {
        if (startTimestamp > endTimestamp) {
            return -this.getDuration(endTimestamp, startTimestamp);
        }

        if (this.#anchorTimestamp && this.#useAnchorForDurationCalc && (this.#anchorTimestamp !== startTimestamp)) {
            if (this.#anchorTimestamp > startTimestamp)
                this.#moveAnchorTimestampEarlier(startTimestamp);
            return this.#getDuration(
                this.#anchorTimestamp, endTimestamp) - this.#getDuration(this.#anchorTimestamp, startTimestamp);
        } else {
            return this.#getDuration(startTimestamp, endTimestamp);
        }
    }

    /**
     * Computes the ratio of the pre-split segment to the overall
     * timespan based on the units specified with the class' durationUnit
     * Returns a value bound between zero and 1. If the split is before the
     * start, returns 0. If the split is after the end, returns 1.
     * @param startTimestamp
     * @param splitTimestamp
     * @param endTimestamp
     * @param postSplit
     * @returns {number}
     */
    getDurationRatio(startTimestamp, splitTimestamp, endTimestamp, postSplit = false) {
        const num = postSplit ? this.getDuration(splitTimestamp, endTimestamp)
                              : this.getDuration(startTimestamp, splitTimestamp);
        const den = this.getDuration(startTimestamp, endTimestamp);
        if (num <= 0)
            return 0;
        if (num >= den)
            return 1;
        return num / den;
    }

    /**
     * Computes the number of days in a timespan using a 30E/360 day calendar
     * @param startTimestamp
     * @param endTimestamp
     * @returns {*}
     */
    dayCount360(startTimestamp, endTimestamp) {
        return this.dayCount360WithDateInfo(this.getDateInfo(startTimestamp), this.getDateInfo(endTimestamp));
    }

    dayCount360WithDateInfo(start, end) {
        if (start.day > 30) {
            start.day = 30;
        }
        if (end.day > 30) {
            end.day = 30;
        }

        return (end.year - start.year) * 360 +
               (end.month - start.month) * 30 +
               (end.day - start.day);
    }

    dayCount365(startTimestamp, endTimestamp) {
        let ret = 0;

        let startM = this.#toMoment(startTimestamp);
        let endM = this.#toMoment(endTimestamp);

        let years = endM.year() - startM.year();

        if (years !== 0) {
            endM.add(-years, 'years');
            ret += years * 365;
        }
        ret += endM.diff(startM, 'days');
        return ret;
    }

    /**
     * Mutates startM
     */
    #incrementMomentByMonth(startM, anchorToDayOfMonth = null, numMonths = 1) {
        startM.add(numMonths, 'months');
        if (anchorToDayOfMonth) {
            if (startM.date() < anchorToDayOfMonth) {
                startM.set('date', Math.min(startM.daysInMonth(), anchorToDayOfMonth));
            } else if (startM.date() > anchorToDayOfMonth) {
                startM.set('date', anchorToDayOfMonth);
            }
        }
        return startM;
    }

    /**
     * Does not mutate startM
     */
    #socotraIncrementMomentByMonth(startM, baseDate) {
        const startDate = startM.date();
        const startDaysInMonth = startM.daysInMonth();
        const nextMonth = startM.clone().add(1, 'months');
        const startDomBeforeBaseDom = startDate < baseDate;
        const nextMonthBeforeBaseDom = nextMonth.date() < baseDate;
        if (startDate === startDaysInMonth && startDomBeforeBaseDom && nextMonthBeforeBaseDom) {
            return nextMonth.set('date', Math.min(nextMonth.daysInMonth(), baseDate));
        } else {
            return nextMonth;
        }
    }

    #round7(amount) {
        return Math.round(amount * 10000000.0) / 10000000.0;
    }
    #toMoment(timestamp) {
        return moment(timestamp).tz(this.#timeZone);
    }
}
exports.DateCalc = DateCalc;
