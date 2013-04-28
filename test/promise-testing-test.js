//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).

define(['chai','sinon','sinon-chai','Q','../promise-testing.js'],
function(chai,sinon,sinonChai,q,PromiseTester){
    chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match;

    describe('promise-testing',function(){
        var deferred,promise,engine;
        beforeEach(function(){
            engine = new PromiseTester();
            deferred = q.defer();
            promise = {//lazy wrapping - allows us to add properties without having to call wrap afterwards
                get then(){
                    return engine.wrap(deferred.promise).then;
                }
            }

        });


        it('wrapped promises can use then just like a standard promise',function(done){
            promise.then(
                function(result){
                    expect(result).to.equal('hello');
                }
            ).then(
                function(){
                    done();
                },
                done
            );
            deferred.resolve('hello');
        });

        describe('property access',function(){
            it('then will not have a "to" sub-property by default',function(){
                expect(promise.then).not.to.have.property('to');
            });

            it('adding a "to" thenProperty will create a "to" sub property on promise.then',function(){
                engine.addThenProperty('to',function(){});
                expect(promise.then).to.have.property('to');
            });

            it('accessing the "to" property will instantiate a new instance of the handler',function(){
                var spy = sinon.spy();
                engine.addThenProperty('to',spy);
                expect(spy).not.to.have.been.called;
                promise.then.to;
                expect(spy).to.have.been.calledOnce;
                expect(spy).to.have.been.calledWithNew;
            });
        });

        it('executing a property will call recordExecution on handler and pass arguments',function(){
            var constructor = sinon.spy(function(){
                this.recordExecution = function(){};
                sinon.spy(this,'recordExecution');
            });
            engine.addThenProperty('to',constructor);
            promise.then.to('hello');
            expect(constructor).to.have.been.calledOnce;
            var instance = constructor.firstCall.thisValue;
            expect(instance.recordExecution).to.have.been.calledOnce;
            expect(instance.recordExecution).to.have.been.calledWith('hello');
            expect(instance.recordExecution.firstCall.thisValue).to.equal(instance);
        });


        it('executing "to" will call "recordExecution" on the handler, with original stackEntry, and with arguments');
        it('fulfilling a promise will call "execute" on each handler, in stack order, with correct stack entries, and a ctx');
        it('And-able expectations - allow multiple expectations during same promise');
        it('standard then statements (with functions) can be inserted in the middle of then chain - rejection, etc');
        it('rejections will fast fail through?');
        it('rejections / exceptions will both be handled');
        it('onResolution, onRejection');
        it('notify can be used to call done');
    });

});
