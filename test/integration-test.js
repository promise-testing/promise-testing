
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var q = require('../test-lib/promise-shim.js');
var PromiseTester = require('../index.js');
chai.use(sinonChai);
var expect = chai.expect,
    match = sinon.match;


describe('integration tests',function(){

    var engine,defer,resolve,deferred,reject,promise,noOp;

    beforeEach(function(){
        noOp = function(){};

        engine = new PromiseTester();
        //engine.scanChai(chai);

        defer = q.defer;

        deferred = defer();
        promise = deferred.promise;
        resolve = deferred.resolve;
        reject = deferred.reject;
    });


    describe('single promise',function(){

        var original,originalThen,wrapped;
        beforeEach(function(){
            original = defer().promise;
            sinon.spy(original,'then');
            originalThen = original.then;
            wrapped = engine.wrap(original);
        });

        describe('wrapped promises', function () {

            it('should be the same object', function () {
                expect(original).to.equal(wrapped);
            });

            it('the then method should be replaced',function(){
                expect(originalThen).not.to.equal(wrapped.then);
                expect(originalThen).not.to.equal(original.then);
            });

            it('will call the underlying then method if used as a function',function(){
                var fn1 = function fn1(){};
                var fn2 = function fn2(){};

                wrapped.then(fn1,fn2);

                expect(originalThen).to.have.been.calledWith(fn1,fn2);
            });

        });

        describe('isWrapped', function () {

            it('returns true for wrapped promises', function(){
                expect(engine.isWrapped(original)).to.be.true;
            });

            it('returns false for unwrapped promises', function(){
                expect(engine.isWrapped(defer().promise)).to.be.false;
            });

            it('should throw an error for non-promise truthy objects',function(){
                expect(function(){engine.isWrapped({})}).to.throw(/not a promise/);
            });

            it('should throw an error for non-promise falsey objects',function(){
                expect(function(){engine.isWrapped()}).to.throw(/not a promise/);
            });
        });

    });


    describe('property ', function(){
        var properties, handlers;
        var noOpHandler,noOpHandler2,noOpHandler3;

        beforeEach(function(){
            engine.use(function(_properties_,_handlers_){
                properties = _properties_;
                handlers = _handlers_;
            });

            function noOpHandlers(){
                var noOpHandler = sinon.spy(function noOpHandler_(){
                    this.recordExecution = function recordExecution(){};
                    this.playback = function playback(lastResult,next,ctx){next(lastResult)};
                    sinon.spy(this,'recordExecution');
                    sinon.spy(this,'playback');
                    noOpHandler.instance.push(this);
                });
                noOpHandler.instance=[];
                return noOpHandler;
            }

            noOpHandler = noOpHandlers();
            noOpHandler2 = noOpHandlers();
            noOpHandler3 = noOpHandlers();
        });

        it('should not have a "to" property initially',function(){
            expect(engine.wrap(promise).then).not.to.have.property('to');
        });

        it('adding a "to" propertyHandler will add a "to" property to wrapped "then" methods',function(){
            properties.addProperty('to',noOpHandler);
            expect(engine.wrap(promise).then).to.have.property('to');
        });

        describe('access',function(){
            it('will instantiate a new instance of the handler',function(){
                properties.addProperty('to',noOpHandler);
                expect(noOpHandler).not.to.have.been.called;
                engine.wrap(promise).then.to;
                expect(noOpHandler).to.have.been.calledOnce;
                expect(noOpHandler).to.have.been.calledWithNew;
            });

            it('multiple times will instantiate multiple handlers',function(){
                properties.addProperty('to',noOpHandler);
                expect(noOpHandler).not.to.have.been.called;
                engine.wrap(promise).then.to.to;
                expect(noOpHandler).to.have.been.calledTwice;
                expect(noOpHandler).to.have.always.been.calledWithNew;
            });

            it('will pass the property name to the handler constructor',function(){
                properties.addProperty('to',noOpHandler);
                engine.wrap(promise).then.to;
                expect(noOpHandler).to.have.been.calledWith('to');
            });

            it('will cause handlers to be instantiated in the same order as properties were accessed',function(){
                properties.addProperty('prop1',noOpHandler);
                properties.addProperty('prop2',noOpHandler2);
                properties.addProperty('prop3',noOpHandler3);

                engine.wrap(promise).then.prop1.prop3.prop2;    //prop2 & prop3 are intentionally swapped

                expect(noOpHandler).to.have.been.calledOnce;
                expect(noOpHandler2).to.have.been.calledOnce;
                expect(noOpHandler3).to.have.been.calledOnce;
                expect(noOpHandler.firstCall).to.have.been.calledBefore(noOpHandler3.firstCall);
                expect(noOpHandler3.firstCall).to.have.been.calledBefore(noOpHandler2.firstCall);
            });

        }) ;

        describe('execution',function(){
            it('will call recordExecution on the handler',function(){
                properties.addProperty('to',noOpHandler);
                engine.wrap(promise).then.to('hello');
                expect(noOpHandler.instance[0].recordExecution).to.have.been.calledOnce;
            });

            it('will pass the supplied arguments to the handlers recordExecution method',function(){
                properties.addProperty('to',noOpHandler);
                engine.wrap(promise).then.to('hello');
                expect(noOpHandler.instance[0].recordExecution).to.have.been.calledWithExactly('hello');
            });

            it('will call recordExecution on the propertyHandler before the next property handler is instantiated ',function(){
                properties.addProperty('prop1',noOpHandler);
                properties.addProperty('prop2',noOpHandler2);

                engine.wrap(promise).then.prop1('hello').prop2('goodbye');

                expect(noOpHandler2).to.have.been.calledOnce;
                expect(noOpHandler.instance[0].recordExecution).to.have.been.calledBefore(noOpHandler2.firstCall);
                expect(noOpHandler2.instance[0].recordExecution).to.have.been.calledWith('goodbye');
            });

            it('will create a helpful error if handler has no recordExecution method',function(){
                properties.addProperty('dontExecute',function(){this.playback=noOp;});
                expect(function(){engine.wrap(promise).then.dontExecute()}).to.throw(/dontExecute/i);
            });

            it('handlers without recordExecutionMethods can be accessed without an Error',function(){
                properties.addProperty('dontExecute',function(){this.playback=noOp;});
                expect(function(){engine.wrap(promise).then.dontExecute}).not.to.throw();
            });

            it('a handler will have its propName automatically set to propName after instantiation',function(){
                properties.addProperty('blah',noOpHandler);
                engine.wrap(promise).then.blah;
                expect(noOpHandler.instance[0].propName).to.equal('blah')
            });

            xit('a handler will have its propName automatically set before constructor is called',function(){
                properties.addProperty('blah',function(){
                    expect(this.propName).to.equal('blah');
                });
                engine.wrap(promise).then.blah;

            });

        }) ;



    })


});