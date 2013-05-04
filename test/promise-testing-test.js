//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).

define(['chai','sinon','sinon-chai','Q','promise-testing'],
function(chai,sinon,sinonChai,q,PromiseTester){
    chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match;

    function assertFn(fn,message){
        if(typeof fn !== 'function') throw Error(message + ' is not a function. Got: ' + fn);
    }

    /**
     * Hack of deferred - calls to then() on promise just push handlers into an array.
     * It wont actually handle any of the actual chaining of subsequent then commands.
     * resolve and reject methods can take extra index argument
     */
    function SpyDeferred(){
        var resolveHandlers = [], rejectHandlers = [];

        var promise = {
            then:function(resultHandler,rejectionHandler){
                if(resultHandler) assertFn(resultHandler, 'bad then call resultHandler:' + resolveHandlers.length);
                if(rejectionHandler) assertFn(rejectionHandler, 'bad then call rejectionHandler:' + rejectHandlers.length);
                resolveHandlers.push(resultHandler);
                rejectHandlers.push(rejectionHandler);

                return promise;
            }
        };
        this.promise = promise;

        function handleStep(array,name,arg,index){
            if(typeof index !== 'number'){
                index = 0;
            }
            var handler = array[index];
            assertFn(handler,'attempt to ' + name + ' failed. ' + name + 'Handlers[ ' + index+']');

            return handler(arg);
        }

        this.reject = handleStep.bind(null,rejectHandlers,'reject');
        this.resolve = handleStep.bind(null,resolveHandlers,'resolve');

        sinon.spy(this,'reject');
        sinon.spy(this,'resolve');
        sinon.spy(promise,'then');


    }

    describe('promise-testing',function(){
        var deferreds,promise,engine,promises,handler1,handler2, createDeferred,createRealDeferred;
        beforeEach(function(){
            deferreds = [];
            promises = [];
            engine = new PromiseTester();
            handler1 = namedHandler('handler1');
            handler2 = namedHandler('handler2');
            createDeferred = function(){return new SpyDeferred();};
            createRealDeferred = function(){return q.defer();};


            promise = {//lazy wrapping - allows us to add properties without having to call wrap afterwards
                get then(){
                    var  deferred = createDeferred(), promise = engine.wrap(deferred.promise);
                    deferreds.push(deferred);
                    promises.push(promise);
                    return promise.then;
                }
            }

        });

        it('wrapped promises can use then just like a standard promise',function(done){
            createDeferred = createRealDeferred;
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


        it('fulfilling a promise will call "execute" on each handler', function(){
            engine.addThenProperty('result',function(){
                this.execute=function(nl,next,ctx){next(ctx.result);};
            });
            engine.addThenProperty('prop1',handler1);
            engine.addThenProperty('prop2',handler2);
            engine.addThenProperty('prop3',handler1);


            promise.then.result.prop1.prop2.prop3;

            handler1.firstInstance.execute.callsArgWith(1,'goodbye');
            handler2.firstInstance.execute.callsArgWith(1,'adios');
            handler1.secondInstance.execute.callsArgWith(1,'sionara');
            deferreds[0].resolve('hello');

            expect(handler1.firstInstance.execute).to.have.been.calledWith('hello');
            expect(handler2.firstInstance.execute).to.have.been.calledWith('goodbye');
            expect(handler1.secondInstance.execute).to.have.been.calledWith('adios');
        });


        it('a handler with unimplemented recordExecution will give a meaningful error if execution is attempted',
            function(){
                engine.addThenProperty('myProp',function(){});
                expect(function(){promise.then.myProp}).not.to.throw();
                expect(function(){promise.then.myProp()}).to.throw(/myProp/i);
            }
        );

        it('a handler will have its .propName property set automatically after instantiation',function(){
            var instances = [];
            function myHandler(propName){
                instances.push(this);
            }
            engine.addThenProperty('prop1',myHandler);
            engine.addThenProperty('prop2',myHandler);

            promise.then.prop1.prop2;

            expect(instances).to.have.length(2);
            expect(instances[0]).to.have.property('propName','prop1');
            expect(instances[1]).to.have.property('propName','prop2');
        });

        it('a handler that set its own but differing propName value will cause an error',function(){
            function myHandler(propName){
                this.propName = "NOT THE RIGHT PROP";
            }
            engine.addThenProperty('prop1',myHandler);

            expect(function(){promise.then.prop1}).to.throw(/NOT THE RIGHT PROP/i);
        });

        it('each handler will be passed the same execution context',function(){
            engine.addThenProperty('prop1',handler1);
            engine.addThenProperty('prop2',handler1);
            engine.addThenProperty('prop3',handler1);

            promise.then.prop1.prop2.prop3;

            handler1.firstInstance.execute.callsArgWith(1,'goodbye');
            handler1.secondInstance.execute.callsArgWith(1,'adios');
            handler1.thirdInstance.execute.callsArgWith(1,'sionara');

            deferreds[0].resolve('hello');


            var ctx = handler1.firstInstance.execute.firstCall.args[2];
            expect(handler1.secondInstance.execute.firstCall.args[2]).to.equal(ctx);
            expect(handler1.thirdInstance.execute.firstCall.args[2]).to.equal(ctx);
        });

        it('rejection will make reason available on ctx',function(){
            engine.addThenProperty('prop1',handler1);
            promise.then.prop1;
            deferreds[0].reject('blah');
            expect(handler1.firstInstance.execute.firstCall.args[2]).to.have.property('reason','blah');
        });

        it('has property returns false if that property isnt defined yet',function(){
            expect(engine.hasProperty('myProp')).to.equal(false);
        });

        it('has property returns true if that property is already defined',function(){
            engine.addProperty('myProp',handler1);
            expect(engine.hasProperty('myProp')).to.equal(true);
        });

        it('handlers can find out what properties are called after them',function(){

            var spies = [];

            engine.addProperty('check',function TailHandler(propName,tools){
                    var spy = sinon.spy();
                    spies.push(spy);
                    tools.addPropertyListener(spy);
                    this.execute = function(){};
                }
            );

            engine.addProperty('prop1',handler1);
            engine.addProperty('prop2',handler2);

            promise.then.check.prop1;

            expect(spies).to.have.length(1);
            expect(spies[0]).to.have.been.calledOnce.and.calledWith('prop1');


            promise.then.check.prop2.prop1;

            expect(spies).to.have.length(2);
            expect(spies[1]).to.have.been.calledTwice;
            expect(spies[1].firstCall).to.have.been.calledWith('prop2');
            expect(spies[1].secondCall).to.have.been.calledWith('prop1');
        });

        it('listener is only called for the current chain',function(){

            var spies = [];

            engine.addProperty('check',function TailHandler(propName,tools){
                    var spy = sinon.spy();
                    spies.push(spy);
                    tools.addPropertyListener(spy);
                    this.execute = function(){};
                }
            );

            engine.addProperty('prop1',handler1);
            engine.addProperty('prop2',handler2);

            promise.then.check.prop1.prop1.then.prop2.prop2;

            expect(spies).to.have.length(1);
            expect(spies[0]).to.have.been.calledTwice;
            expect(spies[0]).to.have.always.been.calledWith('prop1');
        });

        it('adding an existing property will throw an error',function(){
            engine.addProperty('prop1',handler1);
            expect(function(){engine.addProperty('prop1',handler1)}).to.throw();
        });

        it('addPropertyListener returns a callback which removes the listener',function(){

            var spies = [];

            engine.addProperty('check',
                function TailHandler(propName,tools){
                    var remove, spy = sinon.spy(function(propName){
                        if(propName === 'prop2'){
                            remove();
                        }
                    });
                    spies.push(spy);
                    remove = tools.addPropertyListener(spy);
                    this.execute = function(){};
                }
            );

            engine.addProperty('prop1',handler1);
            engine.addProperty('prop2',handler2);

            promise.then.check.prop1.prop2.prop1;
            expect(spies).to.have.length(1);
            expect(spies[0]).to.have.been.calledTwice;
            expect(spies[0].firstCall).to.have.been.calledWith('prop1');
            expect(spies[0].secondCall).to.have.been.calledWith('prop2');
        });

        it('addPropertyListener returns a callback which removes the second listener',function(){

            var spies = [];

            engine.addProperty('noremove',function(propName,tools){
                var listener = sinon.spy();
                spies.push(listener);
                tools.addPropertyListener(listener);
            });

            engine.addProperty('check',
                function TailHandler(propName,tools){
                    var remove, spy = sinon.spy(function(propName){
                        if(propName === 'prop2'){
                            remove();
                        }
                    });
                    spies.push(spy);
                    remove = tools.addPropertyListener(spy);
                    this.execute = function(){};
                }
            );

            engine.addProperty('prop1',handler1);
            engine.addProperty('prop2',handler2);

            promise.then.noremove.check.prop1.prop2.prop1;
            expect(spies).to.have.length(2);
            expect(spies[0].callCount).to.equal(4);
            expect(spies[1].callCount).to.equal(2);
            expect(spies[1].firstCall).to.have.been.calledWith('prop1');
            expect(spies[1].secondCall).to.have.been.calledWith('prop2');
        });

        it('pulling in other values besides the result/reason (i.e. stubs/spys/mocks, etc)');
        it('expecting rejection of the previous step');
        it('passing a value to the next step');
        it('allowing current value to continue a value');
        it('And-able expectations - allow multiple expectations during same promise');
        it('standard then statements (with functions) can be inserted in the middle of then chain - rejection, etc');
        it('rejections will fast fail through?');
        it('rejections / exceptions will both be handled');
        it('onResolution, onRejection');
        it('notify can be used to call done');
        it('API Patching functions')
    });

});
