//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).

define(['chai','sinon','sinon-chai','Q','../promise-testing.js'],
function(chai,sinon,sinonChai,q,PromiseTester){
    chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match;

    describe('promise-testing',function(){
        var deferreds,promise,engine,promises,handler1,handler2;
        beforeEach(function(){
            deferreds = [];
            promises = [];
            engine = new PromiseTester();
            handler1 = namedHandler('handler1');
            handler2 = namedHandler('handler2');
            promise = {//lazy wrapping - allows us to add properties without having to call wrap afterwards
                get then(){
                    var  deferred = q.defer(), promise = engine.wrap(deferred.promise);
                    deferreds.push(deferred);
                    promises.push(promise);
                    return promise.then;
                }
            }

        });

        it('wrapped promises can use then just like a standard promise',function(done){
            promise.then(
                function(result){
                    expect(result).to.equal('hello');
                }
            ).then(
                function(){
                    done();
                },
                done
            );
            deferreds[0].resolve('hello');
        });

        describe('property access',function(){
            it('then will not have a "to" sub-property by default',function(){
                expect(promise.then).not.to.have.property('to');
            });

            it('adding a "to" thenProperty will create a "to" sub property on promise.then',function(){
                engine.addThenProperty('to',function(){});
                expect(promise.then).to.have.property('to');
            });

            it('accessing the "to" property will instantiate a new instance of the handler',function(){
                var spy = sinon.spy();
                engine.addThenProperty('to',spy);
                expect(spy).not.to.have.been.called;
                promise.then.to;
                expect(spy).to.have.been.calledOnce;
                expect(spy).to.have.been.calledWithNew;
            });
        });

        it('executing a property will call recordExecution on handler and pass arguments',function(){
            var constructor = sinon.spy(function(){
                this.recordExecution = function(){};
                sinon.spy(this,'recordExecution');
            });
            engine.addThenProperty('to',constructor);
            promise.then.to('hello');
            expect(constructor).to.have.been.calledOnce;
            var instance = constructor.firstCall.thisValue;
            expect(instance.recordExecution).to.have.been.calledOnce;
            expect(instance.recordExecution).to.have.been.calledWith('hello');
            expect(instance.recordExecution.firstCall.thisValue).to.equal(instance);
        });

        function namedSpy(name,fn){
            if(!fn) fn = function(){};
            fn.displayName = name;
            return sinon.spy(fn);
        }

        function namedStub(name,fn){
            if(!fn) fn = function(){};
            fn.displayName = name;
            return sinon.stub(fn);
        }
        function addInstance(collection,val){
            if(!collection.instances) collection.instances = [];
            collection.instances.push(val);
            switch (collection.instances.length){
                case 1:
                    collection.firstInstance = val;
                    break;
                case 2:
                    collection.secondInstance = val;
                    break;
                case 3:
                    collection.thirdInstance = val;
                    break;
            }
            collection.lastInstance = val;
        }

        function namedHandler(name){
            var handler;
            function handlerFN(propName){
                this.propName = propName;
                this.recordExecution = function(){};
                this.recordExecution.displayName = name +'['+ propName+'].recordExecution';
                this.execute = function(){};
                this.execute.displayName = name +'['+ propName+'].execute';
                sinon.stub(this,'recordExecution');
                sinon.stub(this,'execute');

                //this.execute = namedStub(name +'['+ propName+'].execute');
                addInstance(handler,this);
                if(!handler[propName]){
                    handler[propName] = {};
                }
                addInstance(handler[propName],this);
            }
            handlerFN.displayName = name;
            handler = sinon.spy(handlerFN);
            handler.instances = [];

            return handler;
        }

        it('named handler utility method',function(){

            new handler1('prop1');
            new handler2('prop2');
            new handler1('prop3');
            new handler1('prop3');

            expect(handler1.firstInstance.propName).to.equal('prop1');
            expect(handler1.secondInstance.propName).to.equal('prop3');
            expect(handler1.thirdInstance.propName).to.equal('prop3');
            expect(handler1.thirdInstance).to.equal(handler1.prop3.secondInstance);
            expect(handler1.thirdInstance).not.to.equal(handler1.prop3.firstInstance);

            //make sure handler itself is spied
            expect(handler1.firstCall).to.have.been.calledBefore(handler2.firstCall);
            expect(handler1.secondCall).to.have.been.calledAfter(handler2.firstCall);
        });

        it('handler instantiation will happen in order properties are accessed',function(){
            var constructor1 = namedSpy('constructor1');
            var constructor2 = namedSpy('constructor2');

            engine.addThenProperty('do',constructor1);
            engine.addThenProperty('stuff',constructor2);

            promise.then.do.stuff.do;

            expect(constructor1).to.have.been.calledTwice;
            expect(constructor2).to.have.been.calledOnce;
            expect(constructor1).to.have.always.been.calledWithNew;
            expect(constructor2).to.have.always.been.calledWithNew;

            expect(constructor1.firstCall).to.have.been.calledBefore(constructor2.firstCall);

            expect(constructor1.secondCall).to.have.been.calledAfter(constructor2.firstCall);
        });

        it('handlers will be instantiated with propName',function(){

            engine.addThenProperty('prop1',handler1);
            engine.addThenProperty('prop2',handler2);
            engine.addThenProperty('prop3',handler1);

            promise.then.prop1.prop2.prop3.prop1;

            expect(handler1).to.have.been.calledThrice;
            expect(handler2).to.have.been.calledOnce;
            expect(handler1.firstInstance.propName).to.equal('prop1');
            expect(handler2.firstInstance.propName).to.equal('prop2');
            expect(handler1.secondInstance.propName).to.equal('prop3');
            expect(handler1.thirdInstance.propName).to.equal('prop1');
        });

        it('record execution will be called with mirrored values, and in order', function(){
            engine.addThenProperty('prop1',handler1);
            engine.addThenProperty('prop2',handler2);
            engine.addThenProperty('prop3',handler1);

            promise.then.prop1('Good').prop2('Night').prop3('Good').prop1('Luck');

            expect(handler1.firstInstance.recordExecution).to.have.been.calledWith('Good');
            expect(handler2.firstInstance.recordExecution).to.have.been.calledWith('Night');
            expect(handler1.secondInstance.recordExecution).to.have.been.calledWith('Good');
            expect(handler1.thirdInstance.recordExecution).to.have.been.calledWith('Luck');

            expect(handler1.firstInstance.recordExecution)
                .to.have.been.calledBefore(handler2.firstInstance.recordExecution);

            expect(handler2.firstInstance.recordExecution)
                .to.have.been.calledBefore(handler1.secondInstance.recordExecution);

            expect(handler1.secondInstance.recordExecution)
                .to.have.been.calledBefore(handler1.thirdInstance.recordExecution);
        });


        it('fulfilling a promise will call "execute" on each handler', function(done){
            engine.addThenProperty('prop1',handler1);
            engine.addThenProperty('prop2',handler2);
            engine.addThenProperty('prop3',handler1);


            promise.then.prop1.prop2.prop3
                .then(function(result){
                    //expect(result).to.equal('sionara');
                    expect(handler1.firstInstance.execute).to.have.been.calledWith('hello');
                    expect(handler2.firstInstance.execute).to.have.been.calledWith('goodbye');
                    expect(handler1.secondInstance.execute).to.have.been.calledWith('adios');

                    expect(result).to.equal('sionara');
                })
                .then(function(){done();},done);


            handler1.firstInstance.execute.callsArgWith(1,'goodbye');
            handler2.firstInstance.execute.callsArgWith(1,'adios');
            handler1.secondInstance.execute.callsArgWith(1,'sionara');

            deferreds[0].resolve('hello');
        });

        it('propName will be automatically set???');
        it('fulfilling a promise will call "execute" on each handler, in stack order, with correct stack entries, and a ctx');

        it('unimplemented recordExecution will give meaningful error if execution is attempted');
        it('And-able expectations - allow multiple expectations during same promise');
        it('standard then statements (with functions) can be inserted in the middle of then chain - rejection, etc');
        it('rejections will fast fail through?');
        it('rejections / exceptions will both be handled');
        it('onResolution, onRejection');
        it('notify can be used to call done');
    });

});
