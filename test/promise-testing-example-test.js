//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).

define(['chai','sinon','sinon-chai','Q','../promise-testing.js'],
function(chai,sinon,sinonChai,q,PromiseTester){
    //chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match;


    describe('chai-flavor',function(){
        var engine,deferred,promise;

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

        function addThenEchoProperty(prop){
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

        beforeEach(function(){
            deferred = q.defer();
            promise = engine.wrap(deferred.promise);
        });

        it('equals should pass',function(done){
            promise.then.expect('result').to.equal('hello').then.notify(done);
            deferred.resolve('hello');
        });

        it('equals should fail',function(done){
            promise.then.expect('result').to.equal('hello').then.shouldFail(done);
            deferred.resolve('goodbye');
        });

        it('rejection equals should pass',function(done){
            promise.then.expect('rejection').to.equal('goodbye').then.notify(done);
            deferred.reject('goodbye');
        });


        it('rejection equals should fail',function(done){
            promise.then.expect('rejection').to.equal('goodbye').then.shouldFail(done);
            deferred.reject('hello');
        });

        it('multiple expects',function(done){
            promise.then.expect.property('a',1).expect.property('b',2).then.notify(done);

            deferred.resolve({a:1,b:2});
        });

        it('above and below should pass',function(done){
            promise.then.expect.above(5).and.below(10).then.notify(done);
            deferred.resolve(7);
        });

        it('above and below should fail low',function(done){
            promise.then.expect.above(5).and.below(10).then.shouldFail(done);
            deferred.resolve(5);
        });

        it('above and below should fail high',function(done){
            promise.then.expect.above(5).and.below(10).then.shouldFail(done);
            deferred.resolve(10);
        });

        it('at least and at most should pass low',function(done){
            promise.then.expect.at.least(5).and.at.most(10).then.notify(done);
            deferred.resolve(5);
        });

        it('at least and at most should pass high',function(done){
            promise.then.expect.at.least(5).and.at.most(10).then.notify(done);
            deferred.resolve(10);
        });

        it('at least and at most should fail low',function(done){
            promise.then.expect.at.least(5).and.at.most(10).then.shouldFail(done);
            deferred.resolve(4);
        });

        it('at least and at most should fail high',function(done){
            promise.then.expect.at.least(5).and.at.most(10).then.shouldFail(done);
            deferred.resolve(11);
        });

        it('deep equal',function(done){
            promise.then.expect.deep.equal({a:1,b:2}).then.notify(done);
            deferred.resolve({a:1,b:2});
        });

        it('list props',function(){
            var list = [];
            Object.getOwnPropertyNames(chai.Assertion.prototype).forEach(function (val){
                if(true){//val != 'not'){
                    var type = 'ERROR ACCESSING';
                    var log = true;
                    try {
                        type = typeof chai.Assertion.prototype[val];
                        //log = false;
                    }
                    catch(e){/*console.log(val + e)*/}
                    if(log) console.log(val + ":" + type) ;
                    list.push(val);

                }
            });
        });

        it.only('proto support',function(){

            var hasProtoSupport = '__proto__' in Object;
            console.log('proto support: ' + hasProtoSupport);
        })

    });

});
