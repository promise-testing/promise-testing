
function isArray(arr){
    return Object.prototype.toString.call( arr ) === '[object Array]';
}

function buildHandler(definition){
    var constructor = definition.constructor,
        recordExecution = definition.recordExecution,
        playback = definition.playback;

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
    Constructor.prototype.playback = playback;

    return Constructor;
}

var echoHandler = buildHandler({
    recordExecution:false,
    playback:function (lastResult,next){
        next(lastResult[this.propName]);
    }
});

var executableEchoHandler = buildHandler({
    recordExecution:true,
    playback:function(lastResult,next){
        var result = lastResult[this.propName];
        if(this.args){
            result = result.apply(lastResult,this.args);
        }
        next(result);
    }
});

var noOpHandler = buildHandler({playback:function noOpExecute(lastResult,next){next(lastResult);}});



module.exports = {
    buildHandler:buildHandler,
    echoHandler:echoHandler,
    executableEchoHandler:executableEchoHandler,
    noOpHandler:noOpHandler
};

