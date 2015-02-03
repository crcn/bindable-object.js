"use strict";

var EventEmitter    = require("fast-event-emitter"),
protoclass          = require("protoclass"),
watchProperty       = require("./watchProperty"),
toarray             = require("toarray");

/**
 */

function BindableObject (properties) {

  if (properties)
  for (var key in properties) {
    this[key] = properties[key];
  }

  EventEmitter.call(this);
}

watchProperty.BindableObject = BindableObject;

protoclass(EventEmitter, BindableObject, {

  /**
   */

  __isBindable: true,

  /**
   */

  get: function (property) {

    var isString;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      return this[property];
    }

    // avoid split if possible
    var chain    = isString ? property.split(".") : property,
    currentValue = this,
    currentProperty;

    // go through all the properties
    for (var i = 0, n = chain.length - 1; i < n; i++) {

      currentValue    = currentValue[chain[i]];

      if (!currentValue) return;
    }

    // might be a bindable object
    if(currentValue) return currentValue[chain[i]];
  },

  /**
   */

  setProperties: function (properties) {
    this.emit("willSetProperties");
    for (var property in properties) {
      this.set(property, properties[property]);
    }
    this.emit("didSetProperties");
    return this;
  },

  /**
   */

  set: function (property, value) {

    var isString, hasChanged, oldValue, chain;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      hasChanged = (oldValue = this[property]) !== value;
      if (hasChanged) this[property] = value;
    } else {

      // avoid split if possible
      chain     = isString ? property.split(".") : property;

      var currentValue  = this,
      previousValue,
      currentProperty,
      newChain;

      for (var i = 0, n = chain.length - 1; i < n; i++) {

        currentProperty = chain[i];
        previousValue   = currentValue;
        currentValue    = currentValue[currentProperty];


        // need to take into account functions - easier not to check
        // if value exists
        if (!currentValue /* || (typeof currentValue !== "object")*/) {
          currentValue = previousValue[currentProperty] = {};
        }

        // is the previous value bindable? pass it on
        if (currentValue.__isBindable) {

          newChain = chain.slice(i + 1);
          // check if the value has changed
          hasChanged = (oldValue = currentValue.get(newChain)) !== value;
          currentValue.set(newChain, value);
          currentValue = oldValue;
          break;
        }
      }


      if (!newChain && (hasChanged = (currentValue !== value))) {
        currentProperty = chain[i];
        oldValue = currentValue[currentProperty];
        currentValue[currentProperty] = value;
      }
    }

    if (!hasChanged) return value;

    var prop = chain ? chain.join(".") : property;

    this.emit("change:" + prop, value, oldValue);
    this.emit("change", prop, value, oldValue);
    return value;
  },

  /**
   * deprecated
   */

  bind: function (property, fn, now) {
    return watchProperty(this, property, fn, now);
  },

  /**
   */

  watch: function (property, fn) {
    return this.bind(property, fn);
  },

  /**
   */

  dispose: function () {
    this.emit("dispose");
  },

  /**
   */

  toJSON: function () {
    var obj = {}, value;

    var keys = Object.keys(this);

    for (var i = 0, n = keys.length; i < n; i++) {
      var key = keys[i];
      if (key.substr(0, 2) === "__") continue;
      value = this[key];

      if(value && value.__isBindable) {
        value = value.toJSON();
      }

      obj[key] = value;
    }

    return obj;
  }
});


BindableObject.computed = function (properties, fn) {
  properties = toarray(properties);
  fn.compute = properties;
  return fn;
};

module.exports = BindableObject;
