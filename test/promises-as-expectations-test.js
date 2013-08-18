var Q = require('../test-lib/promise-shim.js');
var sinon = require('sinon');
var match = sinon.match;
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));

describe('if a promise is passed as an expected value', function () {

    var engine,playback,inPlayback;

    var properties, handlers;

    function seal(done){
        return function(){done();};
    }

    beforeEach(function(){
        var PromiseTesting = require('../index.js');
        engine = new PromiseTesting();
        inPlayback = false;
        playback = sinon.spy(function(lastResult,next,ctx){
            try {
                inPlayback =true;
               //console.log(this.expected());
                expect(this.expected()).to.equal(ctx.result);
                next(ctx.result);
            }
            finally {
                inPlayback = false;
            }
        });
       // playback.call({args:['hello']},null,function(){},{result:'hello'});
        engine.use(function(_properties,_handlers){
            properties = _properties;
            handlers = _handlers;

            properties.addProperty('equal',handlers.buildHandler({
                constructor:function(propName,listeners){
                    this.listeners = listeners;
                },
                playback:playback,
                recordExecution:['expected']
            }));
//            properties.addProperty('result',handlers.noOpHandler);
//            properties.addProperty('reason',handlers.noOpHandler);
//            properties.addProperty('expect',{
//                constructor:function(listeners){
//                    var that = this;
//                    var listener = listeners.addPropertyListener(function(propName){
//                        listener();
//                        if(propName === 'reason') {
//                            that.type = propName;
//                        }
//                    });
//                    this.type = 'result';
//                },
//                recordExecution:true,
//                playback:function(next){
//                    if(this.args){
//                        next()
//                    }
//                }
//            });
        });
    });

    describe('test shims',function(){
        it('work as expected', function (done) {
            var defer = Q.defer();
            engine.wrap(defer.promise)
                .then.equal('hello')
                .then(function(result){
                    expect(inPlayback).to.equal(false);
                    expect(result).to.equal('hello');
                    expect(playback).to.have.been.calledOnce;
                    expect(playback.firstCall).to.have.been.calledWith(
                        match.any,
                        match.any,
                        match(function(ctx){
                            return ctx.result == 'hello';
                        })
                    );
                    return result;
                }).then(seal(done),done);
            defer.resolve('hello');
        });
    });

    it('it will compare the resolution if promise is a value', function (done) {
        this.timeout = 200;

        var defer1 = Q.defer();

        var defer2 = Q.defer();

        var wrapped = engine.wrap(defer1.promise);


        wrapped.then.equal(defer2.promise).then(seal(done),done);

        defer1.resolve('hello');
        setTimeout(function(){defer2.resolve('hello')},20);


       // done();

    });


    it('it will compare the resolution if promise is a value', function (done) {
        this.timeout = 200;

        var defer1 = Q.defer();

        var defer2 = Q.defer();

        var wrapped = engine.wrap(defer1.promise);


        wrapped.then.equal(defer2.promise).then(seal(done),done);

        defer1.resolve('hello');

        setTimeout(function(){
            expect(playback).not.to.have.been.called;
            defer2.resolve('hello')
        },20);


        // done();

    });
});