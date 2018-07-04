import Ember from "ember";

export default Ember.Route.extend({
  model() {
    return [
      {
        color: "red",
        bricks: [
          {
            size: "2 x 2",
            quantity: 15,
          },
          {
            size: "1 x 3",
            quantity: 17,
          },
        ],
        onSale: false,
      },
      {
        color: "blue",
        bricks: [
          {
            size: "1 x 8",
            quantity: 21,
          },
          {
            size: "2 x 8",
            quantity: 52,
          },
          {
            size: "4 x 3",
            quantity: 33,
          },
          {
            size: "3 x 6",
            quantity: 16,
          },
        ],
        onSale: false,
      },
      {
        color: "green",
        bricks: [
          {
            size: "1 x 1",
            quantity: 13,
          },
          {
            size: "2 x 4",
            quantity: 36,
          },
          {
            size: "2 x 6",
            quantity: 28,
          },
        ],
        onSale: true,
      },
    ];
  },
});
