if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([],
function(){
    'use strict';

    return function(){

        var thenPropertyHandlers = {};

        function addThenProperty(prop,handler){
            thenPropertyHandlers[prop] = handler;
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

        function createHandler(propName){
            var handler = new thenPropertyHandlers[propName](propName);
            if(handler.propName && handler.propName !== propName){
                throw Error('Handler for .' + propName + ' tried to set its own propName of ' + handler.propName);
            }
            handler.propName = propName;
            return handler;
        }

        function wrapPromise(promise){

            var stack,currentExecutionHandler;

            function execute(){
                currentExecutionHandler.apply(null,arguments);
                return execute;
            }

            function simpleThenCall(){
                return promise = promise.then.apply(promise,arguments);
            }

            function createAndPushHandler(propName){
                var handler = createHandler(propName);
                currentExecutionHandler = handler.recordExecution
                    ? handler.recordExecution.bind(handler)
                    : function() {throw Error('property ' + propName + ' can not be executed');};
                stack.push(handler);
            }

            function addChainableGetter(propName,onGet){
                Object.defineProperty(execute,propName,{
                    get:function(){
                        onGet(propName);
                        if(stack.length == 1) promise = promise.then.apply(promise,createExecutionArgs(stack));
                        return execute;
                    },
                    configurable:true
                });
            }

            addChainableGetter('then',function(){
                stack = [];
                currentExecutionHandler = simpleThenCall;
            });

            for(var propName in thenPropertyHandlers){
                if(thenPropertyHandlers.hasOwnProperty(propName)){
                    addChainableGetter(propName,createAndPushHandler);
                }
            }

            return execute;
        }

        this.wrap = wrapPromise;

        this.addThenProperty = addThenProperty;
    };
});
