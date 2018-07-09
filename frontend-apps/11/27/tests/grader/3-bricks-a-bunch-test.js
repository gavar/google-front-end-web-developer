import {moduleFor, test} from "ember-qunit";

moduleFor("route:store/bricks-a-bunch", "Quiz - store/bricks-a-bunch route", {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test("it has the required information", function (assert) {
  let route = this.subject();

  assert.ok(route.actions._super, "it has an \"actions\" object");
  assert.ok(route.actions.addToCart, "it has an \"addToCart\" function");
  assert.ok(route.shoppingCart, "it has the shoppingCart service");
});
