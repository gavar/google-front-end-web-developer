import moduleForAcceptance from "actions/tests/helpers/module-for-acceptance";
import {test} from "qunit";

moduleForAcceptance("Quiz - site functionality");

let originalQuantity;

function getAddToCartButtonCount() {
  return find(".container section button").length;
}

function getCartItemCount() {
  return find(".contents li").length;
}

function getItemQuantity() {
  var quantityPara = $("section p").eq(2);
  var quantity = quantityPara.text().replace(/[^0-9\.]/g, "");
  return quantity;
}

test("visiting /store/bricks-a-bunch", function (assert) {
  visit("/store/bricks-a-bunch");

  andThen(function () {
    assert.equal(getAddToCartButtonCount(), 3, "3 \"Add To Cart\" buttons appear on the page");
  });
});

test("adding item to cart", function (assert) {
  visit("/store/bricks-a-bunch");
  click(".contents button:first");

  andThen(function () {
    assert.equal(currentURL(), "/store/bricks-a-bunch", "The correct path has not been updated to \"/store/bricks-a-bunch\".");
  });

  visit("/cart");
  andThen(function () {
    assert.equal(currentURL(), "/cart", "The correct path has not been updated to \"/cart\".");
    assert.equal(getCartItemCount(), 1, "clicking the first button adds 1 item to the cart");
  });
});

test("adding item to cart removes it from warehouse", function (assert) {
  visit("/store/bricks-a-bunch");

  andThen(function () {
    originalQuantity = getItemQuantity();
    assert.equal(getItemQuantity(), originalQuantity, "clicking the \"Add To Cart\" button adds 1 item to the cart");
  });

  click(".contents button:first");

  andThen(function () {
    assert.equal(getItemQuantity(), originalQuantity - 1, "clicking the \"Add To Cart\" button decreases the warehouse's stock cart");
  });
});
