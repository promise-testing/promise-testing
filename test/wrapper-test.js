
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Q = require('../test-lib/promise-shim.js');
var PromiseTester = require('../index.js');
chai.use(sinonChai);
var expect = chai.expect,
    match = sinon.match;

function matchFn(expected){
    return match(function(val){return val() === expected;});
}

function assertFn(fn,message){
    if(typeof fn !== 'function') throw Error(message + ' is not a function. Got: ' + fn);
}

function seal(done){
    return function(){done();}
}

describe('promise-testing: ',function(){

    var engine,  defer;

    beforeEach(function(){
        engine = new PromiseTester();
        defer = function(){
            var ret = Q.defer();
            ret.promise = engine.wrap(ret.promise);
            return ret;
        }
    });

    describe('wrapped promises',function(done){


        it('can be used just like a real promise',function(){
            var deferred = defer();
            deferred.promise
                .then(function(result){
                    expect(result).to.equal('hello')
                })
                .then(seal(done),done);
            deferred.resolve('hello');
        });

    });

});