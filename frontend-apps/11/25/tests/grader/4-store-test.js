import {test} from "qunit";
import moduleForAcceptance from "service/tests/helpers/module-for-acceptance";

moduleForAcceptance("Quiz - site functionality");

function countElements(container, element) {
  return find(container).find(element).length;
}

function canSeeTemplateContents(textToFind) {
  textToFind = textToFind.toLowerCase();
  return find(".container").text().toLowerCase().indexOf(textToFind) >= 0;
}

test("visiting /store/bricks-a-bunch", function (assert) {
  visit("/store/bricks-a-bunch");

  andThen(function () {
    assert.equal(countElements(".container", "section"), 1, "only 1 section of colors");
  });
});

test("visiting /store/lots-o-bricks", function (assert) {
  visit("/store/lots-o-bricks");

  andThen(function () {
    assert.equal(countElements(".container", "section"), 3, "has 3 sections of colors");
    assert.ok(canSeeTemplateContents("0.03"), "can see price of red 2 x 2 brick");
    assert.ok(canSeeTemplateContents("27"), "can see quantity of red 2 x 6 brick");
    assert.ok(canSeeTemplateContents("0.02"), "can see price of blue 2 x 2 brick");
    assert.ok(canSeeTemplateContents("41"), "can see quantity of green 2 x 8 brick");
  });
});
