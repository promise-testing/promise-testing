
    var chai = require('chai');
    var sinon = require('sinon');
    var sinonChai = require('sinon-chai');
    var Context = require('../lib/context.js');

    chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match;

    describe('constructor', function () {
        it('should save the type',function(){
            expect(new Context('result','val')).to.have.property('type').equal('result');
            expect(new Context('reject','val')).to.have.property('type').equal('reject');
        });
        it('should set ctx.result to value if type is result', function () {
            expect(new Context('result','val')).to.have.property('result').equal('val');
        });
        it('should set ctx.reason to value if type is reject', function () {
            expect(new Context('reject','val')).to.have.property('reason').equal('val');
        });
    });
        
    describe('callStack ',function(){
        it('should call replay on every handler in the stack', function () {
            var handler1 = {playback:sinon.stub()};
            var handler2 = {playback:sinon.stub()};
            handler1.playback.callsArgWith(1,'handler1');
            handler2.playback.callsArgWith(1,'handler2');

            Context.callStack([handler1,handler2],new Context('result','hey'));

            expect(handler1.playback).calledOnce;
            expect(handler2.playback).calledOnce;

        });
        it('should return the last value set to ctx.returnValue', function() {
            var value = Context.callStack([
                {playback:function(result,next,ctx){
                    ctx.returnValue = 'hello';
                    next(null);
                }},
                {playback:function(result,next,ctx){
                    ctx.returnValue = 'goodbye';
                    next(null);
                }}
            ],new Context());

            expect(value).to.equal('goodbye');
        });
        describe('should throw an error if all handlers do not call next synchronously', function () {
            function stackWithNoNextAt(noNextIndex){
                var stack = [];
                for(var i = 0; i < 4; i++){
                    stack[i] = {
                        propName:  'prop' + i,
                        playback: i == noNextIndex ? function(){} : function(result,next){next(null)}
                    }
                }
                return function(){Context.callStack(stack,new Context())}
            }
            it('first handler', function () {
                expect(stackWithNoNextAt(0)).to.throw(/prop0/);
            });
            it('second handler', function () {
                expect(stackWithNoNextAt(1)).to.throw(/prop1/);
            });
            it('third handler', function () {
                expect(stackWithNoNextAt(2)).to.throw(/prop2/);
            });
            it('last handler', function () {
                expect(stackWithNoNextAt(3)).to.throw(/prop3/);
            });
        });
    });

    describe('createExecutionArgs', function () {
        var stack;
        beforeEach(function(){
            stack = [
                {
                    propName:'prop1',
                    playback:function(result,next,ctx){next(null);}
                },
                {
                    propName:'prop2',
                    playback:function(result,next,ctx){next(null);}
                }
            ]
        });

        it('should create two args that are both functions', function () {
            var args = Context.createExecutionArgs(stack);
            expect(args).to.have.length(2);
            expect(args[0]).to.be.a('function');
            expect(args[1]).to.be.a('function');
        });

        it('result handler should return the the returnValue',function(){
            stack[1].playback = function(result,next,ctx){
                ctx.returnValue = 'hello';
                next(null);
            };
            var args = Context.createExecutionArgs(stack);
            expect(args[0]('val')).to.equal('hello');
        });

        it('reject handler should return the the returnValue',function(){
            stack[1].playback = function(result,next,ctx){
                ctx.returnValue = 'hello';
                next(null);
            };
            var args = Context.createExecutionArgs(stack);

            expect(args[1]('val')).to.equal('hello');
        });

        it('result handler should have context type of result',function(){
            stack[1].playback = function(result,next,ctx){
                expect(ctx).to.have.property('type').equal('result');
                next(null);
            };
            Context.createExecutionArgs(stack)[0]('thisIsTheResult');
        });

        it('result handler should have result value saved in context',function(){
            stack[1].playback = function(result,next,ctx){
                expect(ctx).to.have.property('result').equal('thisIsTheResult');
                next(null);
            };
            Context.createExecutionArgs(stack)[0]('thisIsTheResult');
        });


        it('reject handler should have context type of reject',function(){
            stack[1].playback = function(result,next,ctx){
                expect(ctx).to.have.property('type').equal('reject');
                next(null);
            };
            Context.createExecutionArgs(stack)[1]('thisIsTheResult');
        });

        it('reject handler should have reason value saved in context',function(){
            stack[1].playback = function(result,next,ctx){
                expect(ctx).to.have.property('reason').equal('thisIsTheResult');
                next(null);
            };
            Context.createExecutionArgs(stack)[1]('thisIsTheResult');
        });


    });
    
    
    

