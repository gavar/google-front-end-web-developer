import Ember from "ember";

export default Ember.Route.extend({
  warehouse: Ember.inject.service("brick-warehouse"),
  shoppingCart: Ember.inject.service("shopping-cart"),

  actions: {
    addToCart(color, size, price) {
      this.get("warehouse").hold(color, size);
      this.get("shoppingCart").addToCart(color, size, price);
    },
  },

  model() {
    return this.get("warehouse").getRedBricks();
  },
});
