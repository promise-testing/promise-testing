//`require('promise-testing')` returns a no-arg constructor.
var PromiseTesting = require('promise-testing');
//Most projects will only need a single instance.
//You may want to consider instantiating it in a [bootstrap file](https://github.com/chaijs/chai/blob/master/test/bootstrap/index.js).
var engine = new PromiseTesting();

//There is built in support for the [Chai](http://chaijs.com/) assertion library.
//Just set it up as you normally would.
var chai = require('chai'),
    expect = chai.expect;


//Then add all your chai plugins.
var sinon = require('sinon');
chai.use(require('sinon-chai'));

//Then call the scanChai method.<br/>
//It is important that this is done **after** the rest of your chai setup.
/*Must come after chai setup is complete*/
engine.scanChai(chai);

//The library is compatible with all [Promise/A+](http://promises-aplus.github.io/promises-spec/) compliant promises.
var Q = require('q');

//**METHODS UNDER TEST**
/*Methods Under Test*/
//Suppose we want to test an object `async` with two functions:
var async = {
//`async.sum` takes two numeric arguments
//and returns a promise. After a short delay, the returned promise is resolved
//with the sum of the two arguments.
    sum:function(a,b){
        var defer = Q.defer();
        setTimeout(function(){
            defer.resolve(a+b);
        },10);
        return defer.promise;
    },
//Similarly, `async.sub` takes two numeric arguments
//and returns a promise. After a short delay, the returned promise is resolved
//with the result of subracting the second argument from the first.
    sub:function(a,b){
        var defer = Q.defer();
        setTimeout(function(){
            defer.resolve(a-b);
        },10);
        return defer.promise;
    }
};

//**INSTRUMENTING PROMISES**

//In order to provide the syntactic sugar for testing, the promises returned by our
//`async` object need to be wrapped by the test engine. There are a number of ways to do this:

/*INSTRUMENTING PROMISES*/
//Individual promises can be wrapped explicitly.
var wrappedPromise = engine.wrap(async.sum(2,2));

//Functions that return promises can be wrapped so that all returned promises are automatically wrapped.
async.sum = engine.wrapf(async.sum); //no 'this' reference

//Methods can be patched.
engine.patch(async,'sum');

//**TESTING**
describe('async.sum', function () {


//Without the `promise-testing` library, even this simplistic example requires a fairly verbose test.

    it('1+2=3', function (done) {
        async.sum(1,2).then.expect.result.to.equal(3).then.notify(done);
    });
    it('2+3=5', function (done) {
        async.sum(2,3).then.expect.result.to.equal(5).then.notify(done);
    });
});
