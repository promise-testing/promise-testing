if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([],
function(){
    'use strict';


    function isArray(arr){
        return Object.prototype.toString.call( arr ) === '[object Array]';
    }

    function Properties() {
        var thenPropertyHandlers = {},propNames=[];

        function addProperty(prop,handler){
            if(thenPropertyHandlers[prop]) throw Error(prop + ' already defined');
            propNames.push(prop);
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
        this.getPropertyNames = function(){return propNames.slice();};
        this.getHandler = function(propName){return thenPropertyHandlers[propName];} ;
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



    function createExecutionArgs(stack){
        function callStack(result,reason){

            var index = 0,
                ctx = {
                    result:result,
                    reason:reason,
                    returnValue:result
                };

            function next(_result){
                if(index >= stack.length) return;
                stack[index++].execute(_result,next,ctx);
            }

            next(null);
            //noinspection JSUnusedAssignment
            return ctx.returnValue;
        }

        return [
            callStack,
            function(result){return callStack(null,result)}
        ];
    }

    function noOpExecute(lastResult,next){next(lastResult);}

    return {
        Properties:Properties,
        noOpExecute:noOpExecute,
        buildHandler:buildHandler,
        createExecutionArgs:createExecutionArgs,
        isArray:isArray
    }

});
