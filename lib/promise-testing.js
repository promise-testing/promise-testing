if (typeof define !== 'function') {
    var define = require('amdefine')(module,require);
}

define(['./promise-testing-utils.js'],
function(utils){
    'use strict';

    return function(){
        var properties = new utils.Properties();

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

        this.addProperty = properties.addProperty.bind(properties);

        this.hasProperty = properties.hasProperty;

        this.patch = function(obj,prop){
            if(!obj || typeof obj[prop] !== 'function') throw Error('Obj must exist and obj[prop] must be a function');

            var fn = obj[prop];
            var self = this;

            obj[prop] = function(){
                return self.wrap(fn.apply(this,arguments));
            }
        }
    };
});
