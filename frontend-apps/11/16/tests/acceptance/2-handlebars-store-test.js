import moduleForAcceptance from "handlebars/tests/helpers/module-for-acceptance";
import {test} from "qunit";

moduleForAcceptance("Quiz - Handlebars Template");

function canSeeTemplateContents(textToFind) {
  return find(".container").text().toLowerCase().indexOf(textToFind) >= 0;
}

test("visiting /store", function (assert) {
  visit("/store");

  andThen(function () {
    assert.equal(currentURL(), "/store");
  });
});

test("store has section with heading for each colored brick", function (assert) {
  visit("/store");

  andThen(function () {
    assert.equal(currentURL(), "/store", "The URL is \"/store\"");
    assert.ok(canSeeTemplateContents("red"), "Can see section with a \"red\" heading in template.");
    assert.ok(canSeeTemplateContents("blue"), "Can see section with a \"blue\" heading in template.");
    assert.ok(canSeeTemplateContents("green"), "Can see section with a \"green\" heading in template.");
  });
});

test("red brick section lists brick info", function (assert) {
  visit("/store");

  andThen(function () {
    assert.equal(find(".red-bricks .brick-size").length, 2, "Can see the size for all red bricks.");
    assert.equal(find(".red-bricks .brick-quantity").length, 2, "Can see quantity info for all red bricks.");
  });
});

test("blue brick section lists brick info", function (assert) {
  visit("/store");

  andThen(function () {
    assert.equal(find(".blue-bricks .brick-size").length, 4, "Can see the size for all blue bricks.");
    assert.equal(find(".blue-bricks .brick-quantity").length, 4, "Can see quantity info for all blue bricks.");
  });
});

test("green brick section lists brick info", function (assert) {
  visit("/store");

  andThen(function () {
    assert.equal(find(".green-bricks .brick-size").length, 3, "Can see the size for all green bricks.");
    assert.equal(find(".green-bricks .brick-quantity").length, 3, "Can see quantity info for all green bricks.");
  });
});

test("correct items have \"on-sale\" class", function (assert) {
  visit("/store");

  andThen(function () {
    assert.equal(find(".green-bricks .on-sale").length, 3, "Sale items have \"on-sale\" class.");
  });
});
