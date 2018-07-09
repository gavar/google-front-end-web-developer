import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['col-sm-4 well'],
  classNameBindings: ['sale:on-sale']
});
