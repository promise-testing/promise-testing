if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['promise-testing','chai'],
function(PromiseTesting,chai){
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
    ExpectHandler.prototype.execute = function(lastResult,next,ctx){
        var args;
        switch(this.type){
            case 'result':
                args = [ctx.result];
                break;
            case 'reject':
                args = [ctx.reason];
                break;
            default :
                args = this.args;
        }
        next(expect.apply(null,args));
    };

    function NotifyDone(){
    }
    NotifyDone.prototype.recordExecution = function(done){
        this.done = done;
    };
    NotifyDone.prototype.execute = function(lastResult,next,ctx){
        if(ctx.reason){
            this.done(ctx.reason);
        }
        else {
            this.done();
        }
    };

    PromiseTesting.prototype.scanChai = function(){
        if(!this.hasProperty('expect')){
            this.addProperty('expect',ExpectHandler);
        }
        if(!this.hasProperty('notify')){
            this.addProperty('notify',NotifyDone);
        }

        var self = this;
        ['reject','result','rejected','become','with','rejection'].forEach(function(val){
            self.addNoOpProperty(val);
        });

        var exec,echo = exec = 0;
        Object.getOwnPropertyNames(proto).forEach(function(propName){
            if(!(self.hasProperty(propName) || excludeNames.test(propName))){
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

                    switch(type) {
                        case 'object':
                            self.addEchoProperty(propName);
                            echo++;
                            break;
                        case 'function':
                            self.addExecutableEchoProperty(propName);
                            exec++;
                    }
                }


            }
        });
    }
});
