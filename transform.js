// input push-filter: (emit) -> emit
// output is simple-stream pull-filter: (stream) -> stream
module.exports = pushToPull;
function pushToPull(pushFilter) {
  return function (stream) {
    var dataQueue = [];
    var readQueue = [];
    var reading = false;
    var done = false;

    var emit = pushFilter(onEmit);

    return { read: read, abort: stream.abort };

    function read(callback) {
      if (done) return callback();
      readQueue.push(callback);
      check();
    }

    function check() {
      while (readQueue.length && dataQueue.length) {
        var data = dataQueue.shift();
        readQueue.shift().apply(null, data);
        if (data[1] === undefined) done = true;
      }

      while (done && readQueue.length) {
        readQueue.shift()();
      }

      if (reading || !readQueue.length) return;
      reading = true;
      stream.read(onRead);
    }

    function onRead(err, item) {
      reading = false;
      emit(err, item);
      check();
    }

    function onEmit() {
      dataQueue.push(arguments);
      check();
    }

  };
}
