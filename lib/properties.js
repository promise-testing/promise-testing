if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([],
function(){
    'use strict';

    return function Properties() {
        var thenPropertyHandlers = {};

        function addProperty(prop,handler){
            if(thenPropertyHandlers[prop]) throw Error(prop + ' already defined');
            thenPropertyHandlers[prop] = handler;
        }

        function createHandler(propName,tools){
            var handler = new thenPropertyHandlers[propName](propName,tools);
            if(handler.propName ){
                if( handler.propName !== propName){
                    throw Error('Handler for .' + propName + ' tried to set its own propName of ' + handler.propName);
                }
            }
            else {
                handler.propName = propName;
            }
            return handler;
        }

        this.addProperty = addProperty;
        this.createHandler = createHandler;
        this.getPropertyNames = Object.getOwnPropertyNames.bind(null,thenPropertyHandlers);
        this.hasProperty = thenPropertyHandlers.hasOwnProperty.bind(thenPropertyHandlers);
    }

});
