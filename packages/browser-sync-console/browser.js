(function (console) {
    proxify("log");
    proxify("warn");
    proxify("error");
    function proxify(name) {
        var fn = console[name];
        console[name] = function () {
            fn.apply(console, arguments);
            ___browserSync___.socket.send('console:' + name, ...arguments);
        }
    }
})(console);
