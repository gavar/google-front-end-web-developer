import moduleForAcceptance from "component/tests/helpers/module-for-acceptance";
import {test} from "qunit";

moduleForAcceptance("Quiz - Component");

function countDivs(classToFind) {
  return find(classToFind).find("div").length;
}

function countSaleDivs(classToFind) {
  return find(classToFind).children(".on-sale").length;
}

test("number of div elements", function (assert) {
  visit("/store");

  andThen(function () {
    assert.equal(countDivs(".red-bricks"), 2, "The red bricks section only has 2 div elements");
    assert.equal(countDivs(".blue-bricks"), 4, "The blue bricks section only has 4 div elements");
    assert.equal(countDivs(".green-bricks"), 3, "The green bricks section only has 3 div elements");
    assert.equal(countSaleDivs(".green-bricks"), 3, "Each green brick has the \"on-sale\" class");
  });
});
