var pushToPull = require('./.');

// Create a stream that counts from 1 to infinity and emits the numbers after a
// short delay specefied by `ms`.

// source(ms) -> stream<num>
function source(ms) {
  var i = 0;
  var done = false;
  return { read: read, abort: abort };
  
  function read(callback) {
    if (done) return callback();
    var n = ++i;
    setTimeout(function () {
      callback(null, n);
    }, ms);
  }
  
  function abort(callback) {
    done = true;
    callback();
  }
}

// Consume a stream for at least num items and then tell upstream we're done
// with it.  Wait for the end event and report the events in a continuable.
// sink(stream<num>, maxNum) -> continuable<nums>
function sink(stream, num) {
  var items = [];

  var finish;
  return function (callback) {
    var done = false;
    // Hide the real callback so that it can only be called once.
    finish = function (err, items) {
      if (done) return;
      done = true;
      callback(err, items);
    };
    stream.read(onRead);
  };
  
  function onRead(err, item) {
    // When the end is reached, resolve the continuable
    if (item === undefined) return finish(err, items);
    // Check to see if we've got enough
    if (items.length >= num) {
      stream.abort(onAbort);
      return finish(null, items);
    }
    else {
      items.push(item);
      stream.read(onRead);
    }
  }
  
  function onAbort(err) {
    if (err) return finish(err);
  }
}

var filter = pushToPull(function (emit) {
  return function (item) {
    if (item === undefined) return emit();
    emit(item);
    emit("extra");
  }
});

var stream = source(16);
stream = filter(stream);
sink(stream, 10)(function (err, items) {
  if (err) throw err;
  console.log(items);
});