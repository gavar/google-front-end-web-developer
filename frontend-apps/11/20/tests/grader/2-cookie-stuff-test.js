import moduleForAcceptance from "dynamic-data-p2/tests/helpers/module-for-acceptance";
import {test} from "qunit";

moduleForAcceptance("Acceptance | Quiz - Dynamic Data");

function countElements(selector) {
  return find(selector).length;
}

function canSeeTemplateContents(textToFind) {
  textToFind = textToFind.toLowerCase();
  return find(".container").text().toLowerCase().indexOf(textToFind) >= 0;
}

test("visiting /store/cookies", function (assert) {
  visit("/store/cookies");

  andThen(function () {
    assert.equal(currentURL(), "/store/cookies", "The URL is \"/store/cookies\"");
    assert.ok(canSeeTemplateContents("All Cookies"), "Can see \"All Cookies\" heading in template.");
    assert.equal(countElements(".cookie-name"), 5, "Can see 5 elements with \"cookie-name\" class.");
    assert.equal(countElements(".cookie-count"), 5, "Can see 5 elements with \"cookie-count\" class.");
    assert.equal(countElements(".cookie-price"), 5, "Can see 5 elements with \"cookie-price\" class.");
    assert.equal(countElements(".cookie-per-dozen"), 5, "Can see 5 elements with \"cookie-per-dozen\" class.");
  });
});
