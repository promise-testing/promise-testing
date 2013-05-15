var PromiseTester = require('./lib/promise-testing.js');

var Q = require('q');

var engine = new PromiseTester();

var i = 1;

engine.use(function(properties,handlers){

    properties.addProperty('prop1',handlers.buildHandler(
        {
            execute:function(result,next,ctx){

                if(ctx.result !== 'Hey now') throw Error('expected ' + ctx.result + ' to equal "Hey now"');
                var deferred = Q.defer();

                ctx.returnValue = deferred.promise;

                process.nextTick(function(){
                    deferred.resolve("prop1Resolve");
                },200);

                next(null);
            }
        }
    ));


    properties.addProperty('prop2',handlers.buildHandler(
        {
            execute:function(result,next,ctx){

                if(ctx.result !== 'prop1Resolve') throw Error('expected ' + ctx.result + ' to equal "prop1Resolve"');


            }
        }
    ));
});

var originalDefer = Q.defer();

var wrappedPromise = engine.wrap(originalDefer.promise);

wrappedPromise
    .then.prop1
    .then.prop2;

originalDefer.resolve("Hey now");


