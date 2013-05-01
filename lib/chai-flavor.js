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
        fakeInstance = {assert:function(){}};


    function ExpectHandler(){
        this.type = 'resolve';
    }
    ExpectHandler.prototype.recordExecution = function(type){
        if(/^reject/i.test(type)){
            this.type = 'reject';
        }
        else if(/^res[ou]l/i.test(type)){
            this.type = 'resolve'
        }
        else {
            throw Error('Must be reject or resolve');
        }
    };
    ExpectHandler.prototype.execute = function(lastResult,next,ctx){
        next(expect(ctx[this.type == 'resolve' ? 'result' : 'reason']));
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
                            self.addExecutableEchoProperty(propName);
                            break;
                        case 'function':
                            self.addExecutableEchoProperty(propName);
                    }
                }


            }
        });
    }
});
