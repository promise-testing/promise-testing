if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['chai','sinon','sinon-chai','Q','../lib/promise-testing.js'],
    function(chai,sinon,sinonChai,q,PromiseTester){
        chai.use(sinonChai);
        var expect = chai.expect,
            match = sinon.match;

        var engine;

        beforeEach(function(){
            engine = new PromiseTester();
        });


        describe('isWrapped ', function () {
            it('should be false for unwrapped promises', function () {
                expect(engine.isWrapped(q.defer().promise)).to.be.false;
            });

            it('should be true for wrapped promises', function(){


                expect(engine.isWrapped(engine.wrap(q.defer().promise))).to.be.true;

            })
        });

});