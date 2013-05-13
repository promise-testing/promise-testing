if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([],
function(){
    'use strict';

    return function Context(type,value){
        switch(type){
            case 'reject':
                this.reason = value;
                break;
            case 'result':
                this.result = value;
                break;
        }

        this.type = type;
        this.returnValue = value;

        this.doReturn = function doReturn(){
            return this.returnValue;
        }
    }

});
