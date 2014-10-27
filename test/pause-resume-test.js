var BindableObject = require(".."),
expect       = require("expect.js");

describe("pause-resume#", function () {


  it("can pause & resume a simple binding, and resume it", function () {
    var o = new BindableObject({ name: "abba" }), i = 0;
    var binding = o.bind("name", function (ab) {
      i++;
    }).now();

    expect(i).to.be(1);
    binding.pause();
    binding.now();
    expect(i).to.be(1);
    binding.resume();
    binding.now();
    expect(i).to.be(2);
  });

  it("can pause & resume multiple bindings", function () {
    var o = new BindableObject({ firstName: "a", lastName: "b" }), i = 0;

    var binding = o.bind("firstName, lastName", function () {
      i++;
    }).now();

    expect(i).to.be(1);
    binding.pause();
    binding.now();
    expect(i).to.be(1);
    binding.resume();
    binding.now();
    expect(i).to.be(2);
  });

  xit("can pause & resume a chained property", function () {


    var o = new BindableObject({ 
      friends: new bindable.Collection([
        new BindableObject({ name: "a" }),
        new BindableObject({ name: "b" })
      ])
    });

    var i = 0;

    var binding = o.bind("friends.@each.name", function (names) {
      i++;
    }).now();

    expect(i).to.be(1);
    binding.pause();
    binding.now();
    expect(i).to.be(1);
    binding.resume();
    binding.now();
    expect(i).to.be(2);
  });

  it("doesn't re-trigger a transformed listener", function () {
    var o = new BindableObject({ name: "abba" }), i = 0;
    var binding = o.bind("name", { to: function (ab) {
      i++;
    }}).now();

    expect(i).to.be(1);
    binding.pause();
    binding.now();
    expect(i).to.be(1);
    binding.resume();
    binding.now();
    expect(i).to.be(1);
    o.set("name", "baab");
    expect(i).to.be(2);
    binding.pause();
    o.set("name", "abba");
    binding.resume();
    binding.now();
    expect(i).to.be(3);

  });
});