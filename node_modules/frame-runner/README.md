```javascript
var runner = require("runnerjs")(function (next) {
  requestAnimationFrame(next);
});

runner.run({
  update: function () {
    
  }
});

// run now - bypass request animation frame
runner.update();
```
