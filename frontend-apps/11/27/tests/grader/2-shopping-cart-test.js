import {moduleFor, test} from "ember-qunit";

moduleFor("service:shopping-cart", "Quiz - shopping cart service", {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test("it exists", function (assert) {
  let service = this.subject();
  assert.ok(service);
});

test("it has the required properties", function (assert) {
  let service = this.subject();
  assert.ok(service.cart, "it has a \"cart\" property");
  console.log();
  assert.ok(service.addToCart, "it has a \"addToCart\" property");
  assert.equal(typeof service.addToCart, "function", "addToCart is a function (method)");
});
