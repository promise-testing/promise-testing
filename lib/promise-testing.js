var utils = require('./handler-utils.js');
var Properties = require('./properties.js');
var PropertyListeners = require('./property-listeners.js');
var Context = require('./context.js');
var ChaiFlavor = require('./chai-flavor.js');

function PromiseTester(){
    var properties = new Properties();

    var muteActions = false, isWrapped = false;
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
                    if(muteActions){
                        isWrapped = true;
                        return execute;
                    }
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

    function isWrappedFunction(promise){
        isWrapped = false;
        muteActions = true;
        try {
            promise.then;
            return isWrapped;
        }
        finally {
            muteActions = false;
        }
    }

    this.isWrapped = isWrappedFunction;

    function wrap(promise){
        if(isWrappedFunction(promise)){
            return promise;
        }
        return wrapPromise(promise);
    }

    this.wrap = wrap;

    function wrapf(fn){
        return function(){return wrap(fn.apply(this,arguments))};
    }

    this.wrapf = wrapf;

    this.patch = function(obj,prop){
        if(!obj || typeof obj[prop] !== 'function') throw Error('Obj must exist and obj[prop] must be a function');
        obj[prop] = wrapf(obj[prop]);
    };

    function use(fn){
        fn(properties,utils);
    }

    this.use = use;

    this.scanChai = function (chai) {
        use(ChaiFlavor(chai));
    }
}

module.exports = PromiseTester;