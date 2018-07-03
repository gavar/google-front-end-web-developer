import {test} from "qunit";
import moduleForAcceptance from "routes-and-templates/tests/helpers/module-for-acceptance";

moduleForAcceptance("Quiz - Routes and Template");

function elementExists(elementToFind) {
  return find(elementToFind).text().length > 0;
}

function canSeeTemplateContents(textToFind) {
  return find(".contents").text().toLowerCase().indexOf(textToFind) >= 0;
}

test("Can see brick content after loading /legos", function (assert) {
  visit("/legos");

  andThen(function () {
    assert.equal(currentURL(), "/legos", "The correct path has not been updated to \"/legos\".");
    assert.equal(currentRouteName(), "bricks", "The current route should not have changed, but stayed \"bricks\".");
    assert.equal(elementExists("#brick-heading"), true, "Brick template has a heading with ID \"brick-heading\".");
    assert.equal(elementExists(".colors"), true, "Color list with class \"colors\" exists.");
    assert.equal(canSeeTemplateContents("red"), true, "Can see the color \"red\" in the brick template.");
    assert.equal(canSeeTemplateContents("blue"), true, "Can see the color \"blue\" in the brick template.");
    assert.equal(canSeeTemplateContents("green"), true, "Can see the color \"green\" in the brick template.");
  });
});
