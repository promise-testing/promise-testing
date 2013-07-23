var PromiseTesting = require('../lib/promise-testing.js');
var Q = require('q');

var chai = require('chai'),
    expect = chai.expect;

var async = {
    // Returns a promise that resolves with the value of a+b after a 10ms wait.
    sum:function(a,b){
        var defer = Q.defer();
        setTimeout(function(){
            defer.resolve(a+b);
        },10);
        return defer.promise;
    }
};

var engine = new PromiseTesting();
engine.scanChai(chai);

engine.patch(async,'sum');

describe('async.sum', function () {
    it('1+2=3', function (done) {
        async.sum(1,2).then.expect.result.to.equal(3).then.notify(done);
    });
    it('2+3=5', function (done) {
        async.sum(2,3).then.expect.result.to.equal(5).then.notify(done);
    });
});