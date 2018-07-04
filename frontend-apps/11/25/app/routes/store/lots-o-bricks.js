import Ember from "ember";

export default Ember.Route.extend({
  model() {
    return {
      blue: {
        "2 x 2": {
          quantity: 7,
          price: 0.02,
        },
        "2 x 4": {
          quantity: 2,
          price: 0.04,
        },
      },
      green: {
        "2 x 4": {
          quantity: 13,
          price: 0.04,
        },
        "2 x 8": {
          quantity: 41,
          price: 0.08,
        },
      },
    };
  },
});
