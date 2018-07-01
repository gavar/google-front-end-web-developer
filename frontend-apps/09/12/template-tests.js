QUnit.module( "template", {
  beforeEach: function (assert) {
    // monkey-patch console.log to track the last string and count the calls
    window.savedConsole = console;
    window.logCount = 0;
    window.lastLogged = null;

    window.console = {};
    window.console.log = function (value) {
      window.lastLogged = value;
      window.logCount++;
      if (window.savedConsole) window.savedConsole.log(value);
    };

    assert.ok(window.console !== window.savedConsole, 'before: console.log patched');

  }, afterEach: function (assert) {
    window.console = window.savedConsole;
    delete window.savedConsole;
    assert.ok(!window.savedConsole, 'after: console reset');
  }
});

// Add a custom QUnit assertion to check the console
QUnit.assert.logs = function (logValue, count, message) {
  function describe (v, n) { return v + ' (' + n + ' times)'; }
  this.push(window.lastLogged === logValue && window.logCount === count,
            describe(window.lastLogged, window.logCount),
            describe(logValue, count),
            message);
};

// Now begin the tests
QUnit.test('template returns a function', function (assert) {
  var t = template('Hello, world');
  assert.equal(typeof t, 'function', 'Isa function');
});

QUnit.test('string without delimiters returns itself', function (assert) {
  var t = template('Hello, world');
  t(1);
  assert.logs('Hello, world', 1, 'logged once');
});

QUnit.test('extracts placeholders from template', function (assert) {
  var t = template('1, 2, *(value)*');
  t(3, 1);
  assert.logs('1, 2, 3', 1, 'logged once');
 });

QUnit.test('accepts custom delimiters', function (assert) {
  var t = template('a, b, <<value>>', {open:'<<', close:'>>'});
  t('c', 1);
  assert.logs('a, b, c', 1, 'logged once');
});

QUnit.test('repeat option replicates the string', function (assert) {
  var t = template('1, 2, *(value)*');
  t('a', 2);
  assert.logs('1, 2, a', 2, 'logged twice');
});
