import {moduleFor, test} from "ember-qunit";

moduleFor("route:store/cookies", "Quiz - Cookies Route", {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test("it exists", function (assert) {
  let route = this.subject();
  assert.ok(route);
});

test("its model hook works", function (assert) {
  assert.expect(2);

  let route = this.subject();

  // call the model hook
  let result = route.model();

  // verify something is returned from model hook (and that it's Promise-based)
  assert.ok(typeof result !== "undefined", "Model hook returns something.");

  // assert.ok(typeof result !== 'undefined', 'JSON file is returned from model hook.');

  result.then(function response(data) {
    assert.equal(data.length, 5, "Model data contains 5 objects.");
  });

});
