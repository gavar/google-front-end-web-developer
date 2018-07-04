import Ember from "ember";

export default Ember.Route.extend({
  shoppingCart: Ember.inject.service("shopping-cart"),

  model() {
    return this.get("shoppingCart").getCart();
  },

});
