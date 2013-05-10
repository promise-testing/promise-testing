if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./chai-flavor.js'],
function(chaiFlavor){
    'use strict';

    return chaiFlavor;
});
