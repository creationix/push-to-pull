push-to-pull
============

Convert a push-filter to a pull-filter (for simple streams)

Usage is simple.  Define your filter as an `(emit) -> emit` transform where `emit` is `(err, item)`.  Then when you need an `(stream) -> stream` filter, use this module to convert it.

```js
var pushToPull = require('push-to-pull');

// Dumb filter that inputs numbers and outputs that many monkeys
// Encoded as an (emit) -> emit transform filter.
function pushFilter(emit) {
  return function (item) {
    if (item === undefined) return emit();
    for (var i = 1; i <= item; i++) {
      emit("MONKEY " + i);
    }  
  }
}

// Same filter, but as a (stream) -> stream transform filter
var pullFilter = pushToPull(pushFilter);
```
