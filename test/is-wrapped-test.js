
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var q = require('../test-lib/promise-shim.js');
var PromiseTester = require('../lib/promise-testing.js');
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
    });

});
