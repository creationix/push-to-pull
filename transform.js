// input push-filter: (emit) -> emit
// output is simple-stream pull-filter: (stream) -> stream
module.exports = pushToPull;
function pushToPull(pushFilter) {
  return function (stream) {
    var extras = Array.prototype.slice.call(arguments, 1);
    var queue = [];
    var output = null;
    var done = false;

    var emit = pushFilter.apply(null, [onEmit].concat(extras));

    return { read: read, abort: stream.abort };

    function read(callback) {
      if (done) return callback();
      if (queue.length) {
        return callback.apply(null, queue.shift());
      }
      if (output) return callback(new Error("Only one read allowed at a time"));
      output = callback;
      stream.read(emit);
    }

    function onEmit(err, item) {
      if (output) {
        var callback = output;
        output = null;
        callback(err, item);
      }
      else {
        queue.push(arguments);
      }
    }

  };
}
