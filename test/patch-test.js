'use strict';
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var PromiseTesting = require('../index.js');

chai.use(sinonChai);
var expect = chai.expect,
    match = sinon.match;

describe('patch',function(){

    it('should throw an error of obj is null', function () {
        var engine = new PromiseTesting() ;
        expect(function(){engine.patch(null,'toBePatche')}).to.throw();
    });

    it('should throw an error if the property does not exist', function () {
        var engine = new PromiseTesting() ;
        expect(function(){engine.patch({},'toBePatched')}).to.throw();
    });

    it('should throw an error if the property does not exist', function () {
        var engine = new PromiseTesting() ;
        expect(function(){engine.patch({a:true},'a')}).to.throw();
    });

    it('should wrap the specified function with a new one',function(){
        var engine = new PromiseTesting() ;
        function myFunc(){}
        var obj = {'a':myFunc};
        engine.patch(obj,'a');
        expect(obj.a).not.to.equal('myFunc');
    });

    it('wrappedPromise returns a wrapped value', function () {
        var engine = new PromiseTesting();
        var retVal = {then:function(){}};
        function myFunc(){return retVal}

        var obj = {'a':myFunc};

        expect(engine.isWrapped(obj.a())).to.equal(false);
        engine.patch(obj,'a');
        expect(engine.isWrapped(obj.a())).to.equal(true);
    });

});


