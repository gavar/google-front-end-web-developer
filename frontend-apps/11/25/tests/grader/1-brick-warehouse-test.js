import {moduleFor, test} from "ember-qunit";

moduleFor("service:brick-warehouse", "Quiz - Service", {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test("it exists", function (assert) {
  let service = this.subject();
  assert.ok(service);
});

test("it has the correct data", function (assert) {
  let service = this.subject();

  assert.ok(service.bricks, "it has a \"bricks\" property");
  assert.equal(service.bricks.red["2 x 2"].quantity, 48, "the \"bricks\" object has accurate red brick data");
  assert.equal(service.bricks.blue["2 x 4"].quantity, 2, "the \"bricks\" object has accurate blue brick data");
  assert.equal(service.bricks.green["2 x 8"].quantity, 41, "the \"bricks\" object has accurate green brick data");
});
