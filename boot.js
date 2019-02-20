"use strict";

window.$ = window.jQuery = require('./assets/js/jquery-3.2.1.min.js');

require("./index_main").init();

/* Property for getting the stack trace. Used by below two properties. */
Object.defineProperty(global, '__STACK__', {
  get: function () {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, this.get);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});
