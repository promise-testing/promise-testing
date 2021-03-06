function callStack(stack,ctx){
    var index = 0;
    function next(_result){
        if(index == stack.length){
            index++;
            return;
        }
        stack[index++].playback(_result,next,ctx);
    }
    next(null);
    index--;
    if(index != stack.length){
        throw Error(stack[index].propName + ' at index ' + index + ' did not call next');
    }
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
        function(result){return callStack(stack,new Context('result',result));},
        function(reason){return callStack(stack,new Context('reject',reason));}
    ];
}

Context.createExecutionArgs = createExecutionArgs;
Context.callStack = callStack;

module.exports = Context;
