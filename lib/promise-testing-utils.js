if (typeof define !== 'function') {
    var define = require('amdefine')(module,require);
}

define(['./context.js','./properties.js'],
function(Context,Properties){
    'use strict';

    function isArray(arr){
        return Object.prototype.toString.call( arr ) === '[object Array]';
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

    var noOpHandler = buildHandler({execute:function noOpExecute(lastResult,next){next(lastResult);}});

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


    return {
        Properties:Properties,
        buildHandler:buildHandler,
        createExecutionArgs:createExecutionArgs,
        isArray:isArray,
        echoHandler:echoHandler,
        executableEchoHandler:executableEchoHandler,
        noOpHandler:noOpHandler
    }
});
