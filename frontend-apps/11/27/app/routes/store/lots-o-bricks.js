import Ember from "ember";

export default Ember.Route.extend({
  warehouse: Ember.inject.service("brick-warehouse"),

  model() {
    return this.get("warehouse").getBricks();
  },
});
