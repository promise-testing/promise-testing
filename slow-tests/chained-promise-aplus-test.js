
describe('chains can be used as standard promises without side effect',function(){

    var PromiseTester = require('../index.js');
    var engine = new PromiseTester();
    var q = require('../test-lib/promise-shim.js');
    var chai = require('chai');
    var expect = chai.expect;

    engine.use(function(properties,handlers){
        properties.addProperty('return',handlers.buildHandler({
            recordExecution:['returnValue'],
            playback:function(lastResult,next,ctx){
                ctx.returnValue=this.returnValue;
                next(lastResult);
            }
        }));

        properties.addProperty('expectToEqual',handlers.buildHandler({
            recordExecution:['expectation'],
            playback:function(lastResult,next,ctx){
                expect(ctx.result).to.equal(this.expectation);
                next(lastResult);
            }
        }));
    });



    function pending () {
        var d1 = q.defer();
        engine.wrap(d1.promise);
        var d2 = q.defer();
        var p = d1.promise.then.expectToEqual('hello').return(d2.promise);

        d1.resolve('hello');
        return {
            promise: p,
            fulfill: d2.resolve,
            reject: d2.reject
        };
    }

    function fulfilled(val){
        var d = pending();
        d.fulfill(val);
        return d.promise;
    }


    function rejected(val){
        var d = pending();
        d.reject(val);
        return d.promise;
    }

    require("promises-aplus-tests").mocha({
        fulfilled:fulfilled,
        rejected:rejected,
        pending:pending
    });
});