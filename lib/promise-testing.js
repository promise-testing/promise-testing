if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['promise-testing-utils'],
function(utils){
    'use strict';

    return function(){
        var properties = new utils.Properties();

        var echoHandler = utils.buildHandler({
            recordExecution:false,
            execute:function (lastResult,next){
                next(lastResult[this.propName]);
            }
        });

        function addEchoProperty(propName){
            properties.addProperty(propName,echoHandler);
        }

        var executableEchoHandler = utils.buildHandler({
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
            properties.addProperty(propName,executableEchoHandler);
        }

        function addExecutableProperty(propName,constructor,recordExecution,execute){
            properties.addProperty(propName,
                utils.buildHandler({constructor:constructor,recordExecution:recordExecution,execute:execute})
            );
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
                var handler = properties.createHandler(propName,{addPropertyListener:addPropertyListener});
                currentExecutionHandler = handler.recordExecution
                    ? handler.recordExecution.bind(handler)
                    : function() {throw Error('property ' + propName + ' can not be executed');};
                stack.push(handler);
            }

            function addChainableGetter(propName,onGet){
                Object.defineProperty(execute,propName,{
                    get:function(){
                        onGet(propName);
                        if(stack.length == 1) promise = promise.then.apply(promise,utils.createExecutionArgs(stack));
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

            properties.getPropertyNames().forEach(function(propName){
                addChainableGetter(propName,createAndPushHandler);
            });

            return execute;
        }

        this.wrap = wrapPromise;

        this.addThenProperty = this.addProperty = properties.addProperty.bind(properties);
        this.addExecutableProperty = addExecutableProperty;

        this.addEchoProperty = addEchoProperty;
        this.addExecutableEchoProperty = addExecutableEchoProperty;
        this.addNoOpProperty = function(propName){
            properties.addProperty(propName,
                utils.buildHandler({execute:utils.noOpExecute})
            );
        };

        this.hasProperty = properties.hasProperty;
    };
});
