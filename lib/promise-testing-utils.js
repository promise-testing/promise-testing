if (typeof define !== 'function') {
    var define = require('amdefine')(module,require);
}

define([],
function(){
    'use strict';


    function isArray(arr){
        return Object.prototype.toString.call( arr ) === '[object Array]';
    }

    function Properties() {
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

    function buildHandler(definition){
        var constructor = definition.constructor,
            recordExecution = definition.recordExecution,
            execute = definition.execute;

        function Constructor(){
            if(constructor) constructor.apply(this,arguments);
        }

        if(recordExecution === true){
            recordExecution = function(){this.args = arguments;};
        }
        else if(isArray(recordExecution)){
            var array = recordExecution;
            recordExecution = function(){
                for(var i = 0, l = array.length; i < l; i++){
                    this[array[i]] = arguments[i];
                }
            }
        }

        Constructor.prototype.recordExecution =  recordExecution;
        Constructor.prototype.execute = execute;

        return Constructor;
    }


    function callStack(stack,ctx){
        var index = 0;
        function next(_result){
            if(index >= stack.length) return;
            stack[index++].execute(_result,next,ctx);
        }
        next(null);
        //noinspection JSUnusedAssignment
        return ctx.doReturn();
    }

    function createExecutionArgs(stack){
        return [
            function(result){callStack(stack,new Context('result',result));},
            function(reason){callStack(stack,new Context('reject',reason));}
        ];
    }

    function noOpExecute(lastResult,next){next(lastResult);}

    function Context(type,value){
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

    return {
        Properties:Properties,
        noOpExecute:noOpExecute,
        buildHandler:buildHandler,
        createExecutionArgs:createExecutionArgs,
        isArray:isArray
    }

});
