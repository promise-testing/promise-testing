
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var q = require('../test-lib/promise-shim.js');
var PromiseTester = require('../index.js');
chai.use(sinonChai);
var expect = chai.expect,
    match = sinon.match;


describe('integration tests',function(){

    var engine = new PromiseTester();
    engine.scanChai(chai);

    var defer = q.defer;

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

            describe('can be used as standard promises without side effect',function(){
                require("promises-aplus-tests").mocha({
                    fulfilled: function(val){return engine.wrap(q.resolve(val))},
                    rejected: function(val){return engine.wrap(q.reject(val))},
                    pending:function () {
                        var deferred = q.defer();
                        engine.wrap(deferred.promise);

                        return {
                            promise: deferred.promise,
                            fulfill: deferred.resolve,
                            reject: deferred.reject
                        };
                    }
                });
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

});