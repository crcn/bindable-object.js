var BindableObject = require(".."),
expect       = require("expect.js");

describe("object-multiple#", function () {


  // emit watching
  it("can bind to multiple properties", function (next) {
    var person = new BindableObject({ firstName: "A", lastName: "B" });
    person.bind("firstName, lastName", function (firstName, lastName) {
      expect(firstName).to.be("A");
      expect(lastName).to.be("B");
      next();
    }).now();
  });


  // not anymore
  it("delays listener if both values change immediately", function (next) {
    var person = new BindableObject();
    person.bind("firstName, lastName", function(firstName, lastName) {
      expect(firstName).to.be("A");
      expect(lastName).to.be("B");
      next();
    });
    person.setProperties({
      firstName: "A",
      lastName: "B"
    })
  })
});
