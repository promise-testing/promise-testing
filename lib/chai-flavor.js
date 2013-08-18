function ChaiFlavor(chai){
    'use strict';


    var Assertion = chai.Assertion,
        proto = Assertion.prototype,
        expect = chai.expect,
        excludeNames = /^(?:length|name|arguments|caller|constructor)$/,
        ignoreProps = /^(?:to|be)$/,
        resultProps = /^(?:result(?:s|ed)?)$/,
        rejectProps = /^(?:reject(?:ed|ion)?)$/,
        fakeInstance = {assert:function(){}};

    function ExpectHandler(propName,tools){
        var self = this,
            remove =  tools.addPropertyListener(function(propName,result){
                if(ignoreProps.test(propName))return;
                remove();

                if(resultProps.test(propName)){
                    self.type = 'result';
                } else if(rejectProps.test(propName)) {
                    self.type = 'reject'
                }
            });
        this.recordExecution = function(){
            remove();
            this.args = arguments;
        }
    }
    ExpectHandler.prototype.playback = function(lastResult,next,ctx){
        var args;
        switch(this.type){
            case 'result':
                if(ctx.type !== 'result'){
                    throw new chai.AssertionError('expected result but got rejection: ' + ctx.reason);
                }
                args = [ctx.result];
                break;
            case 'reject':
                if(ctx.type !== 'reject'){
                    throw new chai.AssertionError('expected rejection but got result: ' + ctx.result);
                }
                args = [ctx.reason];
                break;
            default :
                args = [];
                for(var i = 0; i < this.args.length; i++){
                    args[i] = this.args[i]();
                }
                //args = this.args;
        }
        next(expect.apply(null,args));
    };

    function NotifyDone(){
    }
    NotifyDone.prototype.recordExecution = function(done){
        this.done = done;
    };
    NotifyDone.prototype.playback = function(lastResult,next,ctx){
        if(ctx.reason){
            this.done()(ctx.reason);
        }
        else {
            this.done()();
        }
        next(null);
    };


    return function(properties,handlers){
        properties.addProperty('expect',ExpectHandler);
        properties.addProperty('notify',NotifyDone);

        ['reject','result','rejected','become','with','rejection'].forEach(function(val){
            properties.addProperty(val,handlers.noOpHandler);
        });

        Object.getOwnPropertyNames(proto).forEach(function(propName){
            if(!(properties.hasProperty(propName) || excludeNames.test(propName))){
                var descriptor = Object.getOwnPropertyDescriptor(proto,propName);
                if(descriptor.configurable){
                    var type;
                    if(descriptor.get){
                        try {
                            type = typeof descriptor.get.apply(fakeInstance);
                        }
                        catch(e){}
                    }
                    else if(descriptor.hasOwnProperty('value')){
                        type = typeof descriptor.value;
                    }

                    var handler = type === 'function' ? handlers.executableEchoHandler : handlers.echoHandler;
                    properties.addProperty(propName,handler);
                }
            }
        });

    };

}

module.exports = ChaiFlavor;
