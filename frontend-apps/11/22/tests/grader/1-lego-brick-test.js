import {moduleForComponent, test} from "ember-qunit";
import hbs from "htmlbars-inline-precompile";

moduleForComponent("lego-brick", "Quiz - Component", {
  integration: true,
});

function canSeeTemplateContents(textToFind, componentText) {
  return componentText.indexOf(textToFind) >= 0;
}

test("it renders", function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{lego-brick}}`);

  assert.ok(this.$().text().trim(), "Component exists");
});

test("it handles data", function (assert) {
  let brick = {size: "2 x 2", quantity: 15};

  this.set("brick", brick);

  this.render(hbs`{{lego-brick brick=brick}}`);

  let content = this.$().text().trim();

  assert.ok(canSeeTemplateContents("2 x 2", content), "Component displays brick size");
  assert.ok(canSeeTemplateContents("15", content), "Component displays brick quantity");
});
