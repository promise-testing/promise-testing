if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([],
function(){
    'use strict';

    return function(){

        var thenPropertyHandlers = {};

        function addProperty(prop,handler){
            if(thenPropertyHandlers[prop]) throw Error(prop + ' already defined');
            thenPropertyHandlers[prop] = handler;
        }

        function isArray(arr){
            return Object.prototype.toString.call( arr ) === '[object Array]';
        }

        function addExecutableProperty(propName,constructor,recordExecution,execute){
            addProperty(propName,
                buildHandler({constructor:constructor,recordExecution:recordExecution,execute:execute})
            );
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

        var echoHandler = buildHandler({
            recordExecution:false,
            execute:function (lastResult,next){
                next(lastResult[this.propName]);
            }
        });

        function addEchoProperty(propName){
            addProperty(propName,echoHandler);
        }

        var executableEchoHandler = buildHandler({
            recordExecution:true,
            execute:function(lastResult,next){
                var result = lastResult[this.propName];
                if(this.args){
                    result = result.apply(lastResult,this.args);
                }
                next(result);
            }
        });

        function addExecutableEchoProperty(propName){
            addProperty(propName,executableEchoHandler);
        }

        function noOpExecute(lastResult,next){next(lastResult);}

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

        function wrapPromise(promise){

            var stack,currentExecutionHandler,listeners;

            function execute(){
                currentExecutionHandler.apply(null,arguments);
                return execute;
            }

            function simpleThenCall(){
                return promise = promise.then.apply(promise,arguments);
            }

            function createAndPushHandler(propName){
                listeners.slice().forEach(function(listener){listener.propertyAdded(propName)});
                var handler = createHandler(propName,{addPropertyListener:addPropertyListener});
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

            function PropertyListener (fn){
                var self = this, curriedListeners = listeners;

                listeners.push(this);

                this.remove = function(){
                    for (var i = 0; i < curriedListeners.length; i++) {
                        if(self === curriedListeners[i]){
                            curriedListeners.splice(i,i+1);
                            return;
                        }
                    }
                    // must have already been removed;
                    //throw Error('did not find myself - should never happen')
                };

                this.propertyAdded = function(propName){
                    fn(propName);
                }
            }

            function addPropertyListener(fn){
                return new PropertyListener(fn).remove;
            }

            addChainableGetter('then',function(){
                stack = [];
                listeners = [];
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

        this.addThenProperty = this.addProperty = addProperty;
        this.addExecutableProperty = addExecutableProperty;

        this.addEchoProperty = addEchoProperty;
        this.addExecutableEchoProperty = addExecutableEchoProperty;
        this.addNoOpProperty = function(propName){
            addExecutableProperty(propName,null,null,noOpExecute);
        };

        this.hasProperty = thenPropertyHandlers.hasOwnProperty.bind(thenPropertyHandlers);
    };
});
