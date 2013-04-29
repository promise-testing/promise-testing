//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).

define(['chai','sinon','sinon-chai','Q','../promise-testing.js'],
function(chai,sinon,sinonChai,q,PromiseTester){
    chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match;

    describe('lets do it',function(){
        var engine,deferred,promise;

        function EchoHandler(){
        }
        EchoHandler.prototype.recordExecution = function(){
            this.args = arguments;
        };
        EchoHandler.prototype.execute = function(lastResult,next){
            var result = lastResult[this.propName];
            if(this.args){
                result = result.apply(lastResult,this.args);
            }
            next(result);
        };

        function addThenEchoProperty(prop){
            engine.addThenProperty(prop,EchoHandler);
        }

        function ExpectHandler(){
            this.type = 'resolve';
        }
        ExpectHandler.prototype.recordExecution = function(type){
            if(/^reject/i.test(type)){
                this.type = 'reject';
            }
            else if(/^res[ou]l/i.test(type)){
                this.type = 'resolve'
            }
            else {
                throw Error('Must be reject or resolve');
            }
        };
        ExpectHandler.prototype.execute = function(lastResult,next,ctx){
            next(expect(ctx[this.type == 'resolve' ? 'result' : 'reason']));
        };

        function NotifyDone(){
        }
        NotifyDone.prototype.recordExecution = function(done){
            this.done = done;
        };
        NotifyDone.prototype.execute = function(lastResult,next,ctx){
            if(ctx.reason){
                this.done(ctx.reason);
            }
            else {
                this.done();
            }
        };


        before(function(){
            engine = new PromiseTester();
            engine.addThenProperty('expect',ExpectHandler);
            engine.addThenProperty('notify',NotifyDone);

            ['to','be','been','is','that','and','have','with','at','of','not','deep','ok','true','false',
                'null','undefined','exist','empty',/*'arguments',*/'itself'].forEach(function(prop){
                    addThenEchoProperty(prop,true,false);
                });
            ['a','an','contain','include'/*,'length'*/].forEach(function(prop){
                addThenEchoProperty(prop,true,true);
            });
            ['equal','eql','above','least','below','most','within','instanceof','property','ownProperty'
                ,'match','string','keys','throw','respondTo','satisfy','closeTo'].forEach(function(prop){
                    addThenEchoProperty(prop,false,true);
                });
        });

        beforeEach(function(){
            deferred = q.defer();
            promise = engine.wrap(deferred.promise);
        });

        it('simple equals',function(done){
            promise.then.expect('result').to.equal('hello').then.notify(done);

            deferred.resolve('hello');
        });

        it('simple rejection equals',function(done){
            promise.then.expect('rejection').to.equal('goodbye').then.notify(done);

            deferred.reject('goodbye');
        });

        it('multiple expects',function(done){
            promise.then.expect.property('a',1).expect.property('b',2).then.notify(done);

            deferred.resolve({a:1,b:2})
        })

    });

});
