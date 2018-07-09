import {moduleFor, test} from "ember-qunit";

moduleFor("route:store/bricks-a-bunch", "Quiz - store/bricks-a-bunch route", {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test("injecting the warehouse", function (assert) {
  let route = this.subject();

  assert.ok(route.warehouse, "the \"warehouse\" property exists");
});
