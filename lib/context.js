if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([],
function(){
    'use strict';

    function callStack(stack,ctx){
        var index = 0;
        function next(_result){
            if(index >= stack.length) return;
            stack[index++].playback(_result,next,ctx);
        }
        next(null);
        return ctx.doReturn();
    }

    function Context(type,value){
        switch(type){
            case 'reject':
                this.reason = value;
                break;
            case 'result':
                this.result = value;
                break;
        }

        this.type = type;
        this.returnValue = value;

        this.doReturn = function doReturn(){
            return this.returnValue;
        }
    }

    function createExecutionArgs(stack){
        return [
            function(result){callStack(stack,new Context('result',result));},
            function(reason){callStack(stack,new Context('reject',reason));}
        ];
    }

    Context.createExecutionArgs = createExecutionArgs;
    Context.callStack = callStack;

    return Context;

});
