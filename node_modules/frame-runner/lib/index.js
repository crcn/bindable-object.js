var protoclass = require("protoclass");


if (process.browser) {
  var defaultTick = function (next) {
    requestAnimationFrame(next);
  }
} else {
  var defaultTick = function (next) {
    process.nextTick(next);
  }
}



/**
 */

function Runner (tick) {
  this._animationQueue = [];
  this.tick = tick || defaultTick;
}

protoclass(Runner, {

  /**
   * Runs animatable object on requestAnimationFrame. This gets
   * called whenever the UI state changes.
   *
   * @method animate
   * @param {Object} animatable object. Must have `update()`
   */

  run: function (runnable) {

    // if not browser, or fake app
    if (!process.browser) {
      return runnable.update();
    }

    // push on the animatable object
    this._animationQueue.push(runnable);


    // if animating, don't continue
    if (this._requestingFrame) return;
    this._requestingFrame = true;
    var self = this;

    // run the animation frame, and callback all the animatable objects
    this.tick(function () {
      self.update();
      self._requestingFrame = false;
    });
  },

  /**
   */

  update: function () {
    var queue = this._animationQueue;
    this._animationQueue = [];

    // queue.length is important here, because animate() can be
    // called again immediately after an update
    for (var i = 0; i < queue.length; i++) {
      queue[i].update();

      // check for anymore animations - need to run
      // them in order
      if (this._animationQueue.length) {
        this.update();
      }
    }
  }
});

module.exports = function (tick) {
  return new Runner(tick);
};
