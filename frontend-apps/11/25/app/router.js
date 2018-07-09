import Ember from "ember";
import config from "./config/environment";

const Router = Ember.Router.extend({
  location: config.locationType,
});

Router.map(function () {
  this.route("store", function () {
    this.route("bricks-a-bunch");
    this.route("lots-o-bricks");
  });
  this.route("stores");
});

export default Router;
