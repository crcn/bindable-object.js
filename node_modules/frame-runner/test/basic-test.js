var expect  = require("expect.js"),
runner      = require("..");

describe("animate#", function () {

  var animator;

  beforeEach(function () {
    animator = runner();
  });


  it("doesn't tick if process.browser is false", function () {
    
    var i = 0;
    animator.run({ update: function () {
      i++;
    }});
    expect(i).to.be(1);
  });


  it("runs animations procedurally", function (next) {

      var i = 0;

      global.requestAnimationFrame = function (next) {
        setTimeout(next, 0);
      }

      process.browser = 1;
      animator.run({
        update: function () {
          i++;
          expect(i).to.be(1);
          animator.run({
            update: function () {
              i++;
              expect(i).to.be(2);
            }
          })
        }
      });

      animator.run({
        update: function () {
          i++;
          expect(i).to.be(3);
        }
      });


      setTimeout(function () {
        expect(i).to.be(3);
        next();
      }, 10);
  });


  it("can update immediately", function (next) {
    var i = 0;

    for (var j = 5; j--;)
    animator.run({
      update: function () {
        i++;
      }
    });

    animator.update();
    expect(i).to.be(5);


    setTimeout(function () {
      expect(i).to.be(5);
      next();
    }, 10);
  });


});
