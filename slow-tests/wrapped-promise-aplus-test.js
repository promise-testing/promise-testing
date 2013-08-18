
describe('wrapped promises pass Promises/A+ spec',function(){

    var PromiseTester = require('../index.js');
    var engine = new PromiseTester();
    var q = require('../test-lib/promise-shim.js');

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
