var BindableObject = require(".."),
expect       = require("expect.js");

describe("object-basic#", function () {

  it("can create a bindable object", function () {
    new BindableObject();
  });


  it("can call get() with one property", function () {
    var obj = new BindableObject({ name: "jeff" });
    expect(obj.get("name")).to.be("jeff");
  });

  it("can call get() with a string property expect.jsn", function () {
    var obj = new BindableObject({ city: { zip: 99999 }, a: { b: { c: { d: 5}}} });
    expect(obj.get("city.zip")).to.be(99999);
    expect(obj.get("a.b.c.d")).to.be(5);
  });

  it("returns undefined if a property doesn't exist", function () {
    expect(new BindableObject().get("name")).to.be(undefined);
  });

  it("doesn't create an object if a property doesn't exist", function () {
    var obj = new BindableObject();
    expect(obj.get("a.b.c.d")).to.be(undefined);
    expect(obj.get("a")).to.be(undefined);
  })

  it("can call get() with an array as the property", function () {
    var obj = new BindableObject({ city: { zip: 99999 } });
    expect(obj.get(["city", "zip"])).to.be(99999);
  });


  it("returns the friend object", function () {
    var friend = new BindableObject();
    var obj = new BindableObject({ 
      friend: friend
    });

    expect(obj.get("friend")).to.be(friend);
    expect(obj.get(["friend"])).to.be(friend);
  });

  it("properly jsonifys a bindable object", function () {
    var obj = new BindableObject({
      name: "craig",
      friend: new BindableObject({
        name: "tim"
      })
    });
    var json = obj.toJSON();
    expect(json.name).to.be("craig");
    expect(json.friend.name).to.be("tim");
  });

  it("properly get()s when a property is a bindable object", function () {
    var obj = new BindableObject({ 
      friend: new BindableObject({ 
        name: "jake",
        friend: new BindableObject({
          name: "jeff"
        })
      })
    });
    expect(obj.get("friend.name")).to.be("jake");
    expect(obj.get("friend.friend.name")).to.be("jeff");
  });

  it("can call set() with one property", function () {
    var obj = new BindableObject();
    obj.set("name", "craig");
    expect(obj.get("name")).to.be("craig");
  });

  it("returns the same value on set() even if it hasn't changed", function () {
    var obj = new BindableObject({ name: "craig" });
    expect(obj.set("name", "craig"));
    expect(obj.get("name")).to.be("craig");
  })

  it("can set multiple properties", function () {
    var obj = new BindableObject();
    obj.setProperties({ name: "craig", age: 99 });
    expect(obj.get("name")).to.be("craig");
    expect(obj.get("age")).to.be(99);
  })

  it("can call set() with a string property expect.jsn", function () {
    var obj = new BindableObject();
    obj.set("city.zip", 99999);
    obj.set("a.b.c.d.e", 33333);
    expect(typeof obj.get("city")).to.be("object");
    expect(obj.get("city.zip")).to.be(99999);
    expect(obj.get("a.b.c.d.e")).to.be(33333);
  });


  it("can set a value to undefined", function () {
    var obj = new BindableObject({ a: { b: "blah" }});
    obj.set("a.b", undefined);
    expect(obj.get("a.b")).to.be(undefined);
  })

  it("can call set() with an array property", function () {
    var obj = new BindableObject();
    obj.set(["a", "b", "c", "d", "e"], 99999);
    expect(typeof obj.get("a")).to.be("object");
    expect(obj.get("a.b.c.d.e")).to.be(99999);
  });

  it("returns the value that was assigned", function () {
    var obj = new BindableObject();
    expect(obj.set("a.b.c.d", 99999)).to.be(99999);
    expect(obj.set("a.b.c.d", 55555)).to.be(55555);
    expect(obj.get("a.b.c.d")).to.be(55555);
  })

  it("properly set()s when a property is a bindable object", function () {
    var friend1 = new BindableObject();
    var friend2 = new BindableObject({ friend: friend1 });
    var obj = new BindableObject({ friend: friend2 });
    obj.set("friend.name", "jake");
    obj.set("friend.friend.name", "jeff");
    expect(obj.get("friend.name")).to.be("jake");
    expect(obj.get("friend.friend.name")).to.be("jeff");
  });

  it("emits a change event when a property changes", function (next) {
    var obj = new BindableObject();
    obj.once("change", function (key, value) {
      expect(key).to.be("name");
      expect(value).to.be("liam");
      next();
    });
    obj.set("name", "liam");
  });

  it("emits a change:name event when a property changes", function (next) {
    var obj = new BindableObject({ name: "craig" });
    obj.once("change:name", function (value, oldValue) {
      expect(value).to.be("liam");
      expect(oldValue).to.be("craig");
      next();
    });
    obj.set("name", "liam");
  });

  it("doesn't emit a change event when a property changes", function () {
    var obj = new BindableObject({ name: "liam" }), emitted;
    obj.once("change", function (key, value) {
      expect(key).to.be("name");
      expect(value).to.be("liam");
      next();
    });
    obj.set("name", "liam");
    expect(emitted).to.be(undefined);
  });

  it("emits a change event on a sub model, and itself if the property changes", function () {
    var friend = new BindableObject({ name: "jake" }),
    obj = new BindableObject({ friend: friend }),
    emittedFriend, emittedObj;
    friend.on("change:name", function (value) {
      emittedFriend = value;
    });
    obj.on("change:friend.name", function (value) {
      emittedObj = value;
    });

    obj.set("friend.name", "blake");
    expect(emittedFriend).to.be("blake");
    expect(emittedObj).to.be("blake");
  });

  it("emits dispose after calling dispose()", function () {
    var obj = new BindableObject(), disposed;
    obj.once("dispose", function () {
      disposed = true;
    });
    obj.dispose();
    expect(disposed).to.be(true);
  });

  it("does not return the context of a value that is a bindable object if watched", function () {
    var friend;
    var obj = new BindableObject({ a: {friend: friend = new BindableObject() } });
    obj.bind("a.friend", function (friend2) {
      expect(friend2).to.be(friend);
    }).now();
  });

  it("can bind with an array", function () {
    var obj = new BindableObject({ name: "john" });
    obj.bind(["name"], function (name) {
      expect(name).to.be("john");
    }).now();
  })
});