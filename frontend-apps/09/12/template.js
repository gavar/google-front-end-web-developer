// Create the your own `template` function:
//
// • the `template` function should accept
//    1. a string of the template to parse
//    2. an `options` object for custom delimiters
//        - an `open` property for the open delimiter
//        - a `close` property for the close delimiter
// • the default delimiters the `template` function should use are:
//    1. `*(` for the opening delimiter
//    2. `)*` for the closing delimiter
// • the `template` function should return a function
// • the returned function should accept:
//    1. one argument for each placeholder in the original string
//    2. a number - this is how many times the string should be logged to the console
//
// EXAMPLE:
// in the example below `*(` is my default opening delimiter and `)*` is the default closing delimiter
// var string = "Hi, my name is Richard. And I *( emotion )* this *( thing )*!";
// var logResult = template( string );
// logResult( 'love', 'ice cream', 2 ); // logs the message "Hi, my name is Richard. And I love this ice cream!", twice
//
//
// var string = "Is <<! thing !>> healthy to <<! action !>>?";
// var logResult = template( string, {open: '<<!', close: '!>>'} );
// logResult( 'ice cream', 'consume', 7 ); // logs the message "Is ice cream healthy to consume?", seven times
//

function template(text, options) {
    var opening = options && options.open || "*(";
    var closing = options && options.close || ")*";

    var args = [];
    var subs = [];
    var position = 0;
    while (position < text.length) {
        // find opening delimiter
        var open = text.indexOf(opening, position);
        if (open < 0) break;

        // add text before token
        if (open > position)
            subs.push("\"" + text.substring(position, open) + "\"");

        // do not include delimiter itself
        open += opening.length;

        // find closing delimiter
        var close = text.indexOf(closing, open);
        if (close < 0) break;

        // parse token name
        var token = text.substring(open, close).trim();
        args.push(token);
        subs.push(token);

        // move to next
        position = close + closing.length;
    }

    // last part
    if (position < text.length)
        subs.push("\"" + text.substring(position) + "\"");

    // function body
    var program = "\
    var $text = " + subs.join("+") + ";\
    while(--$times >= 0) console.log($text);";
    args.push("$times");
    args.push(program);
    return Function.apply(void 0, args);
}
