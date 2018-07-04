import {test} from "qunit";
import moduleForAcceptance from "dymanic-data-p1/tests/helpers/module-for-acceptance";

moduleForAcceptance("Quiz - Dynamic Data Setup");

function elementExists(elementToFind) {
  return find(elementToFind).text().length > 0;
}

function countElements(selector) {
  return find(selector).length;
}

function canSeeTemplateContents(textToFind) {
  textToFind = textToFind.toLowerCase();
  return find(".container").text().toLowerCase().indexOf(textToFind) >= 0;
}

function canSeeLink(linkText) {
  return find(".contents").find("a:contains(\"" + linkText + "\")").length;
}

test("visiting /store", function (assert) {
  visit("/store");

  andThen(function () {
    assert.equal(currentURL(), "/store", "The URL is \"/store\"");
    assert.equal(elementExists("#nav-link-store"), true, "Store link in site navigation should have ID \"nav-link-store\".");
    assert.ok(canSeeLink("Cakes"), "Can see the \"Cakes\" link.");
    assert.ok(canSeeLink("Cupcakes"), "Can see the \"Cupcakes\" link.");
    assert.ok(canSeeLink("Cookies"), "Can see the \"Cookies\" link.");
  });
});

test("visiting /store/cakes", function (assert) {
  visit("/store/cakes");

  andThen(function () {
    assert.equal(currentURL(), "/store/cakes", "The URL is \"/store/cakes\"");
    assert.ok(canSeeTemplateContents("All Cakes"), "Can see \"All Cakes\" heading in template.");
  });
});

test("visiting /store/cupcakes", function (assert) {
  visit("/store/cupcakes");

  andThen(function () {
    assert.equal(currentURL(), "/store/cupcakes", "The URL is \"/store/cupcakes\"");
    assert.ok(canSeeTemplateContents("All Cupcakes"), "Can see \"All Cupcakes\" heading in template.");
  });
});

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
