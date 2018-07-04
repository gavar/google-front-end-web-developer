import Ember from "ember";

export default Ember.Route.extend({
  model() {
    return {
      "1 x 1": {
        quantity: 29,
        price: 0.01,
      },
      "2 x 2": {
        quantity: 48,
        price: 0.03,
      },
      "2 x 6": {
        quantity: 27,
        price: 0.05,
      },
    };
  },
});
