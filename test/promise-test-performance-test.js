if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['chai','sinon','sinon-chai','Q','promise-testing','chai-as-promised'],
function(chai,sinon,sinonChai,q,PromiseTester,chaiAsPromised){


    chai.use(sinonChai);
    chai.use(chaiAsPromised);

    var expect = chai.expect,
        match = sinon.match;


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
                console.log('time to complete ' + name + ':' + (finish-start));
                done();
            }
        }
        start  = Date.now();
        testFunc(nextTest);
    }

    describe.skip('performance',function(){

        before(function(){

        });

        function runPromiseEngineTest(done){
            var defer = q.defer();
            engine.wrap(defer.promise).then.expect.equal('hello').then.notify(done);
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

    });


});
