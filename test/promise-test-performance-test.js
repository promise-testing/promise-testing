if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['chai','sinon','sinon-chai','Q','promise-testing','chai-as-promised'],
function(chai,sinon,sinonChai,q,PromiseTester,chaiAsPromised){


    chai.use(sinonChai);
    chai.use(chaiAsPromised);

    var expect = chai.expect,
        match = sinon.match;


    function runTests(name,done,testFunc){
        var i = 0, start,finish;

        function nextTest(err){
            if(err){
                done(err);
                return;
            }

            i++;
            if(i < 1000){
                testFunc(nextTest);
            }
            else {
                finish = Date.now();
                console.log('time to complete ' + name + ':' + (finish-start));
                done();
            }
        }
        start  = Date.now();
        testFunc(nextTest);
    }

    describe.skip('performance',function(){

        function runPromiseEngineTest(done){
            var defer = q.defer();
            engine.wrap(defer.promise).then.expect.equal('hello').then.notify(done);
            defer.resolve('hello');
        }

        it('PromiseEngine',function(done){
            this.timeout(0);
            runTests('PromiseEngine',done,runPromiseEngineTest);
        });

        function runChaiAsPromisedTest(done){
            var defer = q.defer();
            expect(defer.promise).to.eventually.equal('hello').notify(done);
            defer.resolve('hello');
        }

        it('ChaiAsPromised',function(done){
            this.timeout(0);
            runTests('ChaiAsPromised',done,runChaiAsPromisedTest);
        });

    });


    var engine;

    function EchoHandler(){
    }
    EchoHandler.prototype.recordExecution = function(){
        this.args = arguments;
    };
    EchoHandler.prototype.execute = function(lastResult,next){
        var result = lastResult[this.propName];
        if(this.args){
            result = result.apply(lastResult,this.args);
        }
        next(result);
    };

    var echoProps = {};
    function addThenEchoProperty(prop){
        echoProps[prop]=true;
        engine.addThenProperty(prop,EchoHandler);
    }

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

    function ShouldFail(){
    }
    ShouldFail.prototype.recordExecution = function(done){
        this.done = done;
    };
    ShouldFail.prototype.execute = function(lastResult,next,ctx){
        if(ctx.reason){
            this.done();
        }
        else {
            this.done(Error('There Should have been a failure!'));
        }
    };

    before(function(){
        engine = new PromiseTester();
        engine.addThenProperty('expect',ExpectHandler);
        engine.addThenProperty('notify',NotifyDone);
        engine.addThenProperty('shouldFail',ShouldFail);

        ['to','be','been','is','that','and','have','with','at','of','not','deep','ok','true','false',
            'null','undefined','exist','empty',/*'arguments',*/'itself'].forEach(function(prop){
                addThenEchoProperty(prop,true,false);
            });
        ['a','an','contain','include'/*,'length'*/].forEach(function(prop){
            addThenEchoProperty(prop,true,true);
        });
        ['equal','eql','above','least','below','most','within','instanceof','property','ownProperty'
            ,'match','string','keys','throw','respondTo','satisfy','closeTo'].forEach(function(prop){
                addThenEchoProperty(prop,false,true);
            });
    });


});
