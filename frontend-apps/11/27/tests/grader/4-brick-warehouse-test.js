import {moduleFor, test} from "ember-qunit";

moduleFor("service:brick-warehouse", "Quiz - brick warehouse service", {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test("it has the required information", function (assert) {
  let warehouse = this.subject();

  assert.ok(warehouse.hold, "it has a \"hold\" property");
  assert.equal(typeof warehouse.hold, "function", "hold is a function");
});
