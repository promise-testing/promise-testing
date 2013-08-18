function inject(utils,Properties,PropertyListeners,Context,ChaiFlavor){


function PromiseTester(){
    var properties = new Properties();

    var muteActions = false, isWrapped = false;

    function wrapPromise(promise){
        promise.then = _wrapPromise(promise,promise.then);
        return promise;
    }

    function _wrapPromise(promise,then){

        var stack,listeners, nextPromise,
            currentExecutionHandler = simpleThenCall;

        function execute(){
            return currentExecutionHandler.apply(null,arguments);
        }

        function simpleThenCall(){
            return wrapPromise(then.apply(promise,arguments));
        }

        function createAndPushHandler(propName){
            if(!stack){
                stack = [];
                listeners = new PropertyListeners();
                nextPromise = then.apply(promise,Context.createExecutionArgs(stack,listeners));
            }
            listeners.notifyPropertyAdded(propName);
            var handler = properties.createHandler(propName,listeners);
            currentExecutionHandler = handler.recordExecution
                ? function(){
                    handler.recordExecution.apply(handler,arguments);
                    return execute;
                }
                : function() {throw Error('property ' + propName + ' can not be executed');};
            stack.push(handler);
            return execute;
        }

        function addChainableGetter(propName,onGet){
            Object.defineProperty(execute,propName,{
                get:function(){
                    return onGet(propName);
                },
                configurable:true
            });
        }

        addChainableGetter('then',function(){
            if(muteActions){
                isWrapped = true;
                return execute;
            }
            //return wrapPromise(nextPromise).then;
            if(nextPromise){
                return wrapPromise(nextPromise).then;
            }
            else {
                return execute;
            }
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
            promise.then.then;
            return isWrapped;
        }
        finally {
            muteActions = false;
        }
    }

    this.isWrapped = isWrappedFunction;

    function wrap(promise){
      /*  if(isWrappedFunction(promise)){
            return promise;
        }      */
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

    return PromiseTester;
}
module.exports = inject;