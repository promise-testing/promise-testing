if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['chai','sinon','sinon-chai','Q','../lib/promise-testing.js','../lib/chai-flavor.js','chai-as-promised'],
function(chai,sinon,sinonChai,q,PromiseTester,chaiFlavor,chaiAsPromised){


    chai.use(sinonChai);
    chai.use(chaiAsPromised);

    var expect = chai.expect,
        match = sinon.match,
        timing = {};


    function runTests(name,done,testFunc){
        var i = 0, start,finish;

        function nextTest(err){
            if(err){
                done(err);
                return;
            }

            i++;
            if(i < 1000){
                testFunc(nextTest);
            }
            else {
                finish = Date.now();
                timing[name] = finish - start;
               // console.log('time to complete ' + name + ':' + (finish-start));
                done();
            }
        }
        start  = Date.now();
        testFunc(nextTest);
    }

    describe('performance @slow',function(){

        var engine;
        before(function(){
            engine = new PromiseTester();
            engine.use(chaiFlavor);
        });

        function runPromiseEngineTest(done){
            var defer = q.defer();
            engine.wrap(defer.promise).then.expect.result.to.equal('hello').then.notify(done);
            defer.resolve('hello');
        }

        it('PromiseEngine',function(done){
            this.timeout(0);
            runTests('PromiseEngine',done,runPromiseEngineTest);
        });

        function runChaiAsPromisedTest(done){
            var defer = q.defer();
            expect(defer.promise).to.eventually.equal('hello').notify(done);
            defer.resolve('hello');
        }

        it('ChaiAsPromised',function(done){
            this.timeout(0);
            runTests('ChaiAsPromised',done,runChaiAsPromisedTest);
        });

        after(function(){
            var chaiTime = timing.ChaiAsPromised,
                engineTime = timing.PromiseEngine,
                least = Math.min(chaiTime,engineTime),
                most = Math.max(chaiTime,engineTime),
                leastName = chaiTime < engineTime ? 'ChaiAsPromised' : 'PromiseEngine',
                mostName = chaiTime >= engineTime ? 'ChaiAsPromised' : 'PromiseEngine',
                percentDiff = Math.round((most - least)/least * 100);


            console.log(mostName + ' was ' + percentDiff + '% slower than '+ leastName + ' (' + most + 'ms vs. ' + least + 'ms).')






        });
    });


});
