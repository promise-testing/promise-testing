if (typeof define !== 'function') {
    var define = require('amdefine')(module,require);
}

define(['./promise-testing-utils.js','./properties.js','./property-listeners.js','./context.js'],
function(utils,Properties,PropertyListeners,Context){
    'use strict';

    return function(){
        var properties = new Properties();

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
                listeners.notifyPropertyAdded(propName);
                var handler = properties.createHandler(propName,listeners);
                currentExecutionHandler = handler.recordExecution
                    ? handler.recordExecution.bind(handler)
                    : function() {throw Error('property ' + propName + ' can not be executed');};
                stack.push(handler);
            }

            function addChainableGetter(propName,onGet){
                Object.defineProperty(execute,propName,{
                    get:function(){
                        onGet(propName);
                        if(stack.length == 1) promise = promise.then.apply(promise,Context.createExecutionArgs(stack));
                        return execute;
                    },
                    configurable:true
                });
            }

            addChainableGetter('then',function(){
                stack = [];
                listeners = new PropertyListeners();
                currentExecutionHandler = simpleThenCall;
            });

            properties.getPropertyNames().forEach(function(propName){
                addChainableGetter(propName,createAndPushHandler);
            });

            return execute;
        }

        this.wrap = wrapPromise;

        this.patch = function(obj,prop){
            if(!obj || typeof obj[prop] !== 'function') throw Error('Obj must exist and obj[prop] must be a function');

            var fn = obj[prop];
            var self = this;

            obj[prop] = function(){
                return self.wrap(fn.apply(this,arguments));
            }
        };

        this.use = function(fn){
            fn(properties,utils);

        };
    };
});
