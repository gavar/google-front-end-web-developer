QUnit.done(function (details) {

  if (details.passed === details.total) {
    window.dispatchEvent(new CustomEvent("tests-pass", {"detail": "passed"}));
  }

});
