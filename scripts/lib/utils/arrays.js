if (!Array.prototype.toMap)
{
  Object.defineProperty(Array.prototype, 'toMap', {
    value: function toMap(keyFn, valFn = x => x) {
      return new Map(this.map(obj => [keyFn(obj), valFn(obj)]));
    }
  });
}
/* orderBy and orderByDescending should work with nums and strings for comparators */
if (!Array.prototype.orderBy)
{
  Object.defineProperty(Array.prototype, 'orderBy', {
    value: function orderBy(sortKeyFn = x => x) {
      return [...this].sort((a, b) => { let x = sortKeyFn(a); let y = sortKeyFn(b); return x > y ? 1 : x < y ? -1 : 0; });
    }
  });
}
if (!Array.prototype.orderByDescending)
{
  Object.defineProperty(Array.prototype, 'orderByDescending', {
    value: function orderByDescending(sortKeyFn = x => x) {
      return [...this].sort((a, b) => { let x = sortKeyFn(a); let y = sortKeyFn(b); return x > y ? -1 : x < y ? 1 : 0; });
    }
  });
}
if (!Array.prototype.groupBy)
{
  Object.defineProperty(Array.prototype, 'groupBy', {
    value: function groupBy(keyFn, valFn = x => x) {
      return Array.prototype.reduce.call(this, function (map, item) {
        let key = keyFn(item);
        if (map.has(key))
          map.get(key).push(valFn(item));
        else
          map.set(key, [valFn(item)]);
        return map;
      }, new Map());
    }
  });
}
if (!Array.prototype.sum)
{
  Object.defineProperty(Array.prototype, 'sum', {
    value: function sum(valFn = x => x) {
      return this.reduce((sum, x) => sum + valFn(x), 0);
    }
  });
}
if (!Array.prototype.first)
{
  Object.defineProperty(Array.prototype, 'first', {
    value: function first(valFn = x => true) {
      for (let x of this)
        if (valFn(x))
          return x;
      return null;
    }
  });
}
if (!Array.prototype.last)
{
  Object.defineProperty(Array.prototype, 'last', {
    value: function last(valFn = x => true) {
      for (let i = this.length - 1; i >= 0; i--)
        if (valFn(this[i]))
          return this[i];
      return null;
    }
  });
}
if (!Array.prototype.min)
{
  Object.defineProperty(Array.prototype, 'min', {
    value: function min(valFn = x => x) {
      return this.reduce((min, x) => Math.min(valFn(x), min), Infinity);
    }
  });
}
if (!Array.prototype.max)
{
  Object.defineProperty(Array.prototype, 'max', {
    value: function max(valFn = x => x) {
      return this.reduce((max, x) => Math.max(valFn(x), max), -Infinity)
    }
  });
}
if (!Array.prototype.distinct)
{
  Object.defineProperty(Array.prototype, 'distinct', {
    value: function distinct(valFn = x => x) {
      let vals = this.map(x => valFn(x));
      return this.filter((val, idx) => vals.indexOf(valFn(val)) === idx);
    }
  });
}
if (!Array.prototype.findLastIndex)
{
  Object.defineProperty(Array.prototype, 'findLastIndex', {
    value: function findLastIndex(valFn = x => true) {
      let i = this.length;
      while (i--)
      {
        if (valFn(this[i]))
          return i;
      }
      return -1;
    }
  });
}
if (!Array.prototype.count)
{
  Object.defineProperty(Array.prototype, 'count', {
    value: function count(valFn = x => true) {
      return this.filter(valFn).length;
    }
  });
}