if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['chai','sinon','sinon-chai','Q','../lib/promise-testing.js'],
function(chai,sinon,sinonChai,Q,PromiseTesting){
    'use strict';

    chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match,
        engine;

    beforeEach(function(){
        engine = new PromiseTesting();
    });

    describe('addExecutableProperty',function(){

        var constructor,execute,record,deferred = Q.defer() ;

        beforeEach(function(){
            constructor = sinon.spy();
            execute = sinon.spy();
            record = sinon.spy();
            deferred = Q.defer();
        });

        function getInstance(index){
            if(!index)index = 0;
            return constructor.getCall(index).thisValue;
        }

        it('will create a handler',function(){
            engine.addExecutableProperty('prop1',constructor,record,execute);
            engine.wrap(deferred.promise).then.prop1('hello');
            expect(constructor).to.have.been.calledOnce;
            expect(getInstance().propName).to.equal('prop1');
            expect(record).to.have.been.calledWith('hello');
        });

        it('if recordExecution is null, execution will cause an error',function(){
            engine.addExecutableProperty('prop1',constructor,null,execute);
            expect(function () {
                    engine.wrap(deferred.promise).then.prop1('hello');
                }
            ).to.throw();
        });

        it('if recordExecution is true, execution arguments will be saved in.args',function(){
            engine.addExecutableProperty('prop1',constructor,true,execute);
            engine.wrap(deferred.promise).then.prop1('hello');
            expect(getInstance().args).to.eql(['hello']);
        });

        it('if recordExecution is array of strings, arguments will be mapped to properties',function(){
            engine.addExecutableProperty('prop1',constructor,['arg1','arg2'],execute);
            engine.wrap(deferred.promise).then.prop1('hello','goodbye');
            expect(getInstance().arg1).to.eql('hello');
            expect(getInstance().arg2).to.eql('goodbye');
        });

        it('null constructor is acceptable',function(){
            engine.addExecutableProperty('prop1',null,record,execute);
            engine.wrap(deferred.promise).then.prop1('hello','goodbye');

            var instance = record.firstCall.thisValue;
            expect(instance.propName).to.equal('prop1');
            expect(record.firstCall).to.have.been.calledWith('hello','goodbye');
        });

    });



});
