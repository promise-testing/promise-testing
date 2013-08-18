var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Q = require('../test-lib/promise-shim.js');
var PromiseTesting = require('../index.js');

chai.use(sinonChai);
var expect = chai.expect,
    match = sinon.match,
    engine,
    properties,
    utils;

beforeEach(function(){
    engine = new PromiseTesting();
    engine.use(function(p,u){properties = p; utils = u;});
});

describe('addProperty',function(){

    var constructor,playback,record,deferred,options ;

    beforeEach(function(){
        constructor = sinon.spy();
        playback = sinon.spy();
        record = sinon.spy();
        deferred = Q.defer();
        options = {playback:playback,recordExecution:record,constructor:constructor}
    });

    function getInstance(index){
        if(!index)index = 0;
        return constructor.getCall(index).thisValue;
    }

    it('will create a handler',function(){
        properties.addProperty('prop1',utils.buildHandler(options));
        engine.wrap(deferred.promise).then.prop1('hello');
        expect(constructor).to.have.been.calledOnce;
        expect(getInstance().propName).to.equal('prop1');
        expect(record).to.have.been.calledWith(matchFn('hello'));
    });

    it('if recordExecution is null, execution will cause an error',function(){
        options.recordExecution = null;
        properties.addProperty('prop1',utils.buildHandler(options));
        expect(function () {
                engine.wrap(deferred.promise).then.prop1('hello');
            }
        ).to.throw();
    });

    it('if recordExecution is true, execution arguments will be saved in.args',function(){

        options.recordExecution = true;
        properties.addProperty('prop1',utils.buildHandler(options));
        engine.wrap(deferred.promise).then.prop1('hello');
        expect(getInstance().args.length).to.eql(1);
        expect(getInstance().args[0]()).to.eql('hello');

    });

    it('if recordExecution is array of strings, arguments will be mapped to properties',function(){
        options.recordExecution = ['arg1','arg2'];
        properties.addProperty('prop1',utils.buildHandler(options));
        engine.wrap(deferred.promise).then.prop1('hello','goodbye');
        expect(getInstance().arg1()).to.eql('hello');
        expect(getInstance().arg2()).to.eql('goodbye');
    });

    it('null constructor is acceptable',function(){
        options.constructor = null;
        properties.addProperty('prop1',utils.buildHandler(options));
        engine.wrap(deferred.promise).then.prop1('hello','goodbye');

        var instance = record.firstCall.thisValue;
        expect(instance.propName).to.equal('prop1');
        expect(record.firstCall).to.have.been.calledWith(matchFn('hello'),matchFn('goodbye'));
    });


    function matchFn(expected){

        return match(function(val){return expected === val();});
    }
});


