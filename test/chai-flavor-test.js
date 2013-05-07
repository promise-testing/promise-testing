//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).

define(['chai','sinon','sinon-chai','Q','../lib/chai-flavor.js'],
function(chai,sinon,sinonChai,q,PromiseTester){
    chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match;


    describe('chai-flavor',function(){
        var engine,deferred,promise;


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
            engine.scanChai();
            engine.addThenProperty('shouldFail',ShouldFail);
        });

        beforeEach(function(){
            deferred = q.defer();
            promise = engine.wrap(deferred.promise);
        });


        it('spies / etc can be passed to expect',function(done){
            var obj = {message:'hello'};

            promise
                .then.expect(obj).to.have.property('message','hello')
                .then(function(){obj.message='goodbye'})
                .then.expect(obj).to.have.property('message','goodbye')
                .then.notify(done);

            deferred.resolve();
        });

        it('equals should pass',function(done){
            promise.then.expect.result.to.equal('hello').then.notify(done);
            deferred.resolve('hello');
        });

        it('equals should fail',function(done){
            promise.then.expect.result.to.equal('hello').then.shouldFail(done);
            deferred.resolve('goodbye');
        });

        it('rejection equals should pass',function(done){
            promise.then.expect.rejection.to.equal('goodbye').then.notify(done);
            deferred.reject('goodbye');
        });


        it('rejection equals should fail',function(done){
            promise.then.expect.rejection.to.equal('goodbye').then.shouldFail(done);
            deferred.reject('hello');
        });

        it('multiple expects',function(done){
            promise.then.expect.result.property('a',1)
                        .expect.result.property('b',2)
                        .then.notify(done);

            deferred.resolve({a:1,b:2});
        });

        it('above and below should pass',function(done){
            promise.then.expect.result.above(5).and.below(10).then.notify(done);
            deferred.resolve(7);
        });

        it('above and below should fail low',function(done){
            promise.then.expect.result.to.be.above(5).and.below(10).then.shouldFail(done);
            deferred.resolve(5);
        });

        it('above and below should fail high',function(done){
            promise.then.expect.result.to.be.above(5).and.below(10).then.shouldFail(done);
            deferred.resolve(10);
        });

        it('at least and at most should pass low',function(done){
            promise.then.expect.result.to.be.at.least(5).and.at.most(10).then.notify(done);
            deferred.resolve(5);
        });

        it('at least and at most should pass high',function(done){
            promise.then.expect.result.to.be.at.least(5).and.at.most(10).then.notify(done);
            deferred.resolve(10);
        });

        it('at least and at most should fail low',function(done){
            promise.then.expect.result.to.be.at.least(5).and.at.most(10).then.shouldFail(done);
            deferred.resolve(4);
        });

        it('at least and at most should fail high',function(done){
            promise.then.expect.result.to.be.at.least(5).and.at.most(10).then.shouldFail(done);
            deferred.resolve(11);
        });

        it('deep equal',function(done){
            promise.then.expect.result.to.deep.equal({a:1,b:2}).then.notify(done);
            deferred.resolve({a:1,b:2});
        });

        it('notify will call done with rejection arg',function(done){
            promise.then.expect.result.to.equal('goodbye').then.notify(function(reason){
                try{
                    expect(reason).to.be.an.instanceOf(Error);
                }
                catch(e){
                    done(e);
                }
                done();
            });
            deferred.resolve("hello");
        });

        it('notify will call done with no args if it passes',function(done){
            promise.then.expect.result.to.equal('goodbye').then.notify(function(reason){
                try{
                    expect(arguments).to.have.length(0);
                }
                catch(e){
                    done(e);
                }
                done();
            });
            deferred.resolve("goodbye");
        });

        it('using it with spies',function(done){
            var spy = sinon.spy();

            promise
                .then(function(result){spy(result);})
                .then.expect(spy).to.have.been.calledWith('hello')
                .then.notify(done);

            deferred.resolve('hello');
        });

    });

});
