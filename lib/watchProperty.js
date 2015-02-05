"use strict";

var transform   = require("./transform");

function extend (to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
}


function watchSimple (bindable, property, fn) {

  bindable.emit("watching", [property]);

  var listener = bindable.on("change:" + property, function () {
    fn.apply(self, arguments);
  }), self;

  self = {

    /** 
     * the target bindable object
     * @property target
     * @type {BindableObject}
     */

    target: bindable,

    /**
     * triggers the binding listener
     * @method now
     */

    now: function () {
      fn.call(self, bindable.get(property));
      return self;
    },

    /**
     */

    trigger: function () {
      return this.now()
    },

    /**
     * disposes the binding
     * @method dispose
     */

    dispose: function () {
      listener.dispose();
    },

    /**
     */

    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },

    /**
     */

    resume: function () {
      self.pause();
      extend(self, watchSimple(bindable, property, fn));
      return self;
    }
  };

  return self;
}

/*
 * bindable.bind("a.b.c.d.e", fn);
 */


function watchChain (bindable, hasComputed, chain, fn) {

  var listeners = [], values = hasComputed ? [] : undefined, self;


  var onChange = function () {
    dispose();
    listeners = [];
    values = hasComputed ? [] : void 0;
    bind(bindable, chain);
    self.now();
  };

  /*
  if (hasComputed && process.browser) {
    onChange = debounce(bindable, onChange);
  }*/

  function runComputed (eachChain, pushValues) {
    return function (item) {
      if (!item) return;

        // wrap around bindable object as a helper
        if (!item.__isBindable) {
          item = new module.exports.BindableObject(item);
        }

        bind(item, eachChain, pushValues);
    };
  }

  function bind (target, chain, pushValues) {

    var currentChain = [], subValue, currentProperty, i, j, n, computed, hadComputed, pv, cv = target;

    // need to run through all variations of the property chain incase it changes
    // in the bindable.object. For instance:
    // target.bind("a.b.c", fn); 
    // triggers on
    // target.set("a", obj);
    // target.set("a.b", obj);
    // target.set("a.b.c", obj);

    // does it have @each in there? could be something like
    // target.bind("friends.@each.name", function (names) { })
    if (hasComputed) {

      i = 0;
      n = chain.length;

      for (; i < n; i++) {

        currentChain.push(chain[i]);
        currentProperty = chain[i];

        target.emit("watching", currentChain);

        // check for @ at the beginning
        computed = (currentProperty.charCodeAt(0) === 64);

        if (computed) {
          hadComputed = true;
          // remove @ - can't be used to fetch the propertyy
          currentChain[i] = currentProperty = currentChain[i].substr(1);
        }
        
        pv = cv;
        if (cv) cv = cv[currentProperty];

        if (computed && cv) {


          // used in cases where the collection might change that would affect 
          // this binding. length for instance on the collection...
          if (cv.compute) {
            for (j = cv.compute.length; j--;) {
              bind(target, [cv.compute[j]], false);
            }
          }

          // the sub chain for each of the items from the loop
          var eachChain = chain.slice(i + 1);

          // call the function, looping through items
          cv.call(pv, runComputed(eachChain, pushValues));
          break;
        } else if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
          cv = cv.__context;
        }

        listeners.push(target.on("change:" +  currentChain.join("."), onChange));

      } 

      if (!hadComputed && pushValues !== false) {
        values.push(cv);
      }

    } else {
      i = 0;
      n = chain.length;

      for (; i < n; i++) {
        currentProperty = chain[i];
        currentChain.push(currentProperty);

        target.emit("watching", currentChain);

        if (cv) cv = cv[currentProperty];

        // pass the watch onto the bindable object, but also listen 
        // on the current target for any
        if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
        }

        listeners.push(target.on("change:" + currentChain.join("."), onChange));
      }

      if (pushValues !== false) values = cv;
    }
  }

  function dispose () {
    if (!listeners) return;
    for (var i = listeners.length; i--;) {
      listeners[i].dispose();
    }
    listeners = [];
  }

  self = {
    target: bindable,
    now: function () {
      fn.call(self, values);
      return self;
    },
    trigger: function () {
      return this.now()
    },
    dispose: dispose,
    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },
    resume: function () {
      self.pause();
      extend(self, watchChain(bindable, hasComputed, chain, fn));
      return self;
    }
  };

  bind(bindable, chain);

  return self;
}

/**
 */

function watchMultiple (bindable, chains, fn) { 

  var values  = new Array(chains.length),
  oldValues   = new Array(chains.length),
  bindings    = new Array(chains.length),
  fn2         = fn,
  _pause      = false,
  _hasChanged = false,
  self;

  bindings.push(bindable.on("willSetProperties", function () {
    _pause      = true;
    _hasChanged = false;
  }));

  bindings.push(bindable.on("didSetProperties", function () {
    _pause = false;
    if (_hasChanged) onChange();
  }));

  function onChange () {
    _hasChanged = true;
    if (_pause) return;
    fn2.apply(this, values.concat(oldValues));
  }

  function setValues () {
    oldValues = values.concat();
    values    = chains.map(function (property) { 
      return bindable.get(property); 
    });
  }


  chains.forEach(function (chain, i) {
    bindings[i] = bindable.bind(chain, function (value, oldValue) {
      values[i]    = value;
      oldValues[i] = oldValue;
      onChange();
    });
  });

  self = {
    target: bindable,
    now: function () {
      setValues();
      onChange();
      return self;
    },
    trigger: function () {
      return this.now()
    },
    dispose: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].dispose();
      }
      bindings = [];
    },
    pause: function () {
      self.dispose();
      self.now = function () { return self; };
    },
    resume: function () {
      self.pause();
      extend(self, watchMultiple(bindable, chains, fn));
      return self;
    }
  };
  return self;
}

/**
 */

function watchProperty (bindable, property, fn) {

  if (typeof fn === "object") {
    fn = transform(bindable, property, fn);
  }

  // TODO - check if is an array
  var chain;

  if (typeof property === "string") {
    if (~property.indexOf(",")) {
      return watchMultiple(bindable, property.split(/[,\s]+/), fn);
    } else if (~property.indexOf(".")) {
      chain = property.split(".");
    } else {
      chain = [property];
    }
  } else {
    chain = property;
  }

  // collection.bind("length")
  if (chain.length === 1) {
    return watchSimple(bindable, property, fn);

  // person.bind("city.zip")
  } else {
    return watchChain(bindable, ~property.indexOf("@"), chain, fn);
  }
}

module.exports = watchProperty;