//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).
define([],
function(){

    return function(){

        var thenPropertyHandlers = {};

        function addThenProperty(prop,handler){
            thenPropertyHandlers[prop] = handler;
        }

        function wrapPromise(promise){

            var stack = [];

            function execute(){
                currentExecutionHandler.apply(null,arguments);
                return execute;
            }

            function simpleThenCall(){
                return promise = promise.then.apply(promise,arguments);
            }

            function createAndPushHandler(propName){
                var handler = new thenPropertyHandlers[propName](propName);
                if (handler.recordExecution) {
                    currentExecutionHandler = handler.recordExecution.bind(handler);
                } else {
                    currentExecutionHandler = function () {
                        throw Error('property ' + propName + ' can not be executed')
                    };
                }
                stack.push(handler);
                return handler;
            }

            var currentExecutionHandler = simpleThenCall;

            function addExecuteGetter(propName,onGet){
                Object.defineProperty(execute,propName,{
                    get:function(){
                        onGet(propName);
                        return execute;
                    }
                });
            }

            addExecuteGetter('then',function(){});

            for(var propName in thenPropertyHandlers){
                if(thenPropertyHandlers.hasOwnProperty(propName)){
                    addExecuteGetter(propName,createAndPushHandler);
                }
            }

            return execute;
        }

        this.wrap = wrapPromise;

        this.addThenProperty = addThenProperty;
    };
});
