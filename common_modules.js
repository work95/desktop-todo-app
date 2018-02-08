/**
 * @module This module is used to consolidate and export 
 * all the external dependencies that are required often 
 * by most of the modules.
 *
 * @exports fs
 * @exports tracer
 */
var fs = require('fs');
var logger = require('tracer').colorConsole();

module.exports.fs = fs;
module.exports.logger = logger;
