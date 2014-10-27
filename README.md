[![Build Status](https://travis-ci.org/mojo-js/bindable-object.js.svg?branch=master)](https://travis-ci.org/mojo-js/bindable-object.js)

Fast data-binding library 

Two-way data binding means linking properties of two separate objects - when one changes, the other will automatically update with that change.  It enables much easier interactions between data models and UIs, among other uses outside of MVC.

### Example

```javascript
var BindableObject = require("bindable-object");

var person = new BindableObject({
  name: "craig",
  last: "condon",
  location: {
    city: "San Francisco"
  }
});

person.bind("location.zip", function(value) {
  // 94102
}).now();

//triggers the binding
person.set("location.zip", "94102");

//bind location.zip to another property in the model, and do it only once
person.bind("location.zip", function (zip) {
  console.log(zip); // 94102
}).now();

person.bind("name, last", function (fn, ln) {
  console.log(fn, ln); // craig condon
}).now();
```

### Installation

```
npm install bindable-object --save-exact
```

#### BindableObject(properties)

creates a new bindable object

#### value get(property)

Returns a property on the bindable object

```javascript
var obj = new BindableObject({ city: { name: "SF" } });
console.log(obj.get("city"));      // { name: "SF" }
console.log("no getter", obj.city); // { name: "SF" }
console.log(obj.get("city.name")); // SF
console.log("no getter", obj.city.name); // { name: "SF" }
```

#### set(property, value)

Sets a value to the bindable object

```javascript
var obj = new BindableObject();
obj.set("city.name", "SF");
console.log(obj.get("city.name")); // SF
```

#### setProperties(properties)

sets multiple properties on the bindable object

```javascript
var person = new BindableObject();
person.setProperties({
  firstName: "Jon",
  lastName: "Doe"
});
console.log(person.get("firstName"), person.get("lastName")); // Jon Doe
```

#### has(property)

Returns true if the bindable object has a given property

```javascript
var obj = new BindableObject({ count: 0, male: false, name: "craig" });

console.log(obj.has("count")); // true
console.log(obj.has("male")); // true
console.log(obj.has("name")); // true
console.log(obj.has("city")); // false
```

#### listener on(event, callback)

adds a new listener to the bindable object

#### emit(event[,args...])

emits a new event

```javascript
var person = new BindableObject();

person.on("blarg", function (arg1, arg2) {
  console.log(arg1, arg2);
});

person.emit("blarg", "something!", "something again!!");
```

#### once(event, callback)

listens to one event, then disposes the listener.

```javascript
var person = new BindableObject();

person.once("blarg", function (arg1, arg2) {
  console.log(arg1, arg2);
});

person.emit("blarg", "something!", "something again!!");
person.emit("blarg", "never caught again!");
```

#### removeAllListeners([type])

returns all the listeners on the bindable object

#### binding bind(from, options)

`options` - the options for the binding
  - `to` - the property to bind to. Can be a `string`, `array`, or `function`
  - `target` - the target bindable object. Default is self
  - `max` - max number of times to run the data-binding
  - `when` - tests the data-bound value before setting
  - `map` - transforms the data-bound value
  - `bothWays` - makes the data-binding bi-directional.


```javascript
var obj = new BindableObject({ name: "craig" });

// bind the name, but transform it to upper case
obj.bind("name", { to: "name2", map: function (name) {
  return String(name).toUpperCase();
}}).now();

console.log(obj.get("name"), obj.get("name2"));
obj.set("name", "jeff");
console.log(obj.get("name"), obj.get("name2"));
```


#### binding.now()

Executes a binding now

```javascript
var bindable = require("bindable");
var person = new BindableObject({ name: "jeff" });
person.bind("name", function (name, oldName) {
  console.log("binding called, name is: ", name);
}).now();

// above is triggered
person.set("name", "joe");
```


#### binding.dispose()

Disposes a binding

```javascript
var bindable = require("bindable");
var person = new BindableObject({ name: "jeff" });

var binding = person.bind("name", function (name, oldName) {
  console.log("binding called, name is: ", name);
}).now();

binding.dispose();

person.set("name", "jake"); // binding not triggered
```


#### Events

Bindable objects emit a few events:

- `change:*` - emitted when a property changes on the bindable object. E.g: `change:location.zip`.
- `change` - emitted when any property changes on the bindable object
- `watching` - emitted when a property is being watched
- `dispose` - emitted when `dispose()` is called on a bindable object

```javascript
var person = new BindableObject({ name: "jeff" });

person.on("change:name", function (newName) {
  console.log("the name changed to", newName);
});

person.on("change", function (key, value) {
  console.log("some value has changed: ", key, "=", value);
});

person.on("watching", function (property) {
  console.log("watching ", property);
});

person.on("dispose", function () {
  console.log("the object was disposed");
});

person.set("name", "james");
person.set("city", "sf");
person.bind("name", function(){}); // trigger watching
person.dispose();
```
