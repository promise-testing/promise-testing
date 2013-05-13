if (typeof define !== 'function') {
    var define = require('amdefine')(module,require);
}

define([],
function(){
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



    return {
        buildHandler:buildHandler,
       // isArray:isArray,
        echoHandler:echoHandler,
        executableEchoHandler:executableEchoHandler,
        noOpHandler:noOpHandler
    }
});
