// Create your own Event Tracker system:
//
// 1. create an `EventTracker` object
//    • it should accept a name when constructed
// 2. extend the `EventTracker` prototype with:
//    • an `on` method
//    • a `notify` method
//    • a `trigger` method
//
// EXAMPLE:
// function purchase(item) { console.log( 'purchasing ' + item); }
// function celebrate() { console.log( this.name + ' says birthday parties are awesome!' ); }
//
// var nephewParties = new EventTracker( 'nephews ');
// var richard = new EventTracker( 'Richard' );
//
// nephewParties.on( 'mainEvent', purchase );
// richard.on( 'mainEvent', celebrate );
// nephewParties.notify( richard, 'mainEvent' );
//
// nephewParties.trigger( 'mainEvent', 'ice cream' );
//

var EventTracker = function (name) {
    this.name = name;
    this._events = {};
    this._notify = {};
};

EventTracker.prototype.on = function (event, callback) {
    var array = this._events[event] || [];
    this._events[event] = array;
    array.push(callback);
};

EventTracker.prototype.trigger = function (event) {
    var args = Array.prototype.slice.call(arguments, 1);

    var array = this._events[event];
    for (var i = 0, size = array && array.length; i < size; i++)
        array[i].apply(void 0, args);

    var others = this._notify[event];
    for (var i = 0, size = others && others.length; i < size; i++)
        EventTracker.prototype.trigger.apply(others[i], arguments);
};

EventTracker.prototype.notify = function (other, event) {
    var array = this._notify[event] || [];
    this._notify[event] = array;
    array.push(other);
};

function purchase(item) { console.log("purchasing " + item); }
function celebrate() { console.log(this.name + " says birthday parties are awesome!"); }

var nephewParties = new EventTracker("nephews ");
var richard = new EventTracker("Richard");

nephewParties.on("mainEvent", purchase);
richard.on("mainEvent", celebrate);
nephewParties.notify(richard, "mainEvent");

nephewParties.trigger("mainEvent", "ice cream");
