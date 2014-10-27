var Benchmark = require("benchmark"),
suite         = new Benchmark.Suite,
EventEmitter  = require("..");



var em = new EventEmitter();

em.on('oneListener', function(){ });
em.on('twoListeners', function(){ });
em.on('twoListeners', function(){ });
em.on('threeListeners', function(){ });


suite.add("new EventEmitter()", function () {
  new EventEmitter();
})


suite.add("em.on('event', listener).dispose()", function () {
  em.on('event', function(){}).dispose();
});


suite.add("em.once('event', listener); em.emit('event');", function () {
  em.once('event', function(){});
  em.emit('event');
});


suite.add("em.emit('oneListener');", function () {
  em.emit('oneListener');
});

suite.add("em.emit('oneListener', 1);", function () {
  em.emit('oneListener', 1);
});


suite.add("em.emit('oneListener', 1, 2);", function () {
  em.emit('oneListener', 1, 2);
});

suite.add("em.emit('twoListeners');", function () {
  em.emit('twoListeners');
});

suite.add("em.emit('twoListeners', 1);", function () {
  em.emit('twoListeners', 1);
});

suite.add("em.emit('twoListeners', 1, 2);", function () {
  em.emit('twoListeners', 1, 2);
});






suite.on("cycle", function(event) {
  console.log(String(event.target));
});


suite.on("complete", function() {
  console.log("Fastest is '%s'", this.filter("fastest").pluck("name"));
});


suite.run({ async: true });