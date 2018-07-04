import Ember from "ember";
import config from "./config/environment";

const Router = Ember.Router.extend({
  location: config.locationType,
});

Router.map(function () {
  this.route('store', function() {
    this.route('cakes');
    this.route('cupcakes');
    this.route('cookies');
  });
});

export default Router;
