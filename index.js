
var utils = require('./lib/handler-utils.js');
var Properties = require('./lib/properties.js');
var PropertyListeners = require('./lib/property-listeners.js');
var Context = require('./lib/context.js');
var ChaiFlavor = require('./lib/chai-flavor.js');

module.exports = require('./lib/promise-testing.js')(utils,Properties,PropertyListeners,Context,ChaiFlavor);