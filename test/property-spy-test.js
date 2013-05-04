//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).

define(['chai','sinon','sinon-chai','property-spy'],

function(chai,sinon,sinonChai,spyProp){

    chai.use(sinonChai);
    var expect = chai.expect,
        match = sinon.match;


    describe('spyProp',function(){
        var obj;

        function defaultTarget(target){
            return target || obj;
        }

        function count(filter,target){
            return defaultTarget(target).___propertySpyCollection.count(filter);
        }

        function getFilter(prop){
            return function(val){
                return val.isGet && (!prop || (val.prop == prop));
            }
        }

        function setFilter(prop){
            return function(val){
                return (!val.isGet) && (!prop ||(val.prop == prop));
            }
        }

        function anyAccess(prop){
            return function(val){
                return (!prop) || (val.prop == prop)
            };
        }

        function getLogs(target){
            return defaultTarget(target).___propertySpyCollection.get(function(){return true;});
        }

        it('getCount increments with each get',function(){
            obj = {first:'James',last:'Talmage'};
            spyProp(obj,'first','last');

            expect(count(getFilter('first'))).to.equal(0);
            expect(count(getFilter('last'))).to.equal(0);

            obj.first;
            expect(count(getFilter('first'))).to.equal(1);
            expect(count(getFilter('last'))).to.equal(0);

            obj.first;
            expect(count(getFilter('first'))).to.equal(2);
            expect(count(getFilter('last'))).to.equal(0);

            obj.last;
            expect(count(getFilter('first'))).to.equal(2);
            expect(count(getFilter('last'))).to.equal(1);

            obj.last;
            obj.first;
            expect(count(getFilter('first'))).to.equal(3);
            expect(count(getFilter('last'))).to.equal(2);
        });


        it('getCount increments with each get',function(){
            obj = {first:'James',last:'Talmage'};
            spyProp(obj,'first','last');

            expect(count(getFilter('first'))).to.equal(0);
            expect(count(getFilter('last'))).to.equal(0);

            obj.first = 'Billy';
            expect(count(setFilter('first'))).to.equal(1);
            expect(count(setFilter('last'))).to.equal(0);

            obj.first = 'Kyle';
            expect(count(setFilter('first'))).to.equal(2);
            expect(count(setFilter('last'))).to.equal(0);

            obj.last = 'Smith';
            expect(count(setFilter('first'))).to.equal(2);
            expect(count(setFilter('last'))).to.equal(1);

            obj.last = 'Doe';
            obj.first = 'John';
            expect(count(setFilter('first'))).to.equal(3);
            expect(count(setFilter('last'))).to.equal(2);
        });

        //Circular references will make JSON.stringify explode - internally we have wrapped those values.
        it('circular references will not make it explode',function(){
            obj = {first:'James', last:'Talmage'};
            var obj2 = {first:'Susan', last:'Talmage', spouse:obj};
            obj.spouse = obj2;

            spyProp(obj,'first','last','spouse');
            spyProp(obj2,'first','last','spouse');

            expect(count(anyAccess())).to.equal(0);
            expect(count(anyAccess()),obj2).to.equal(0);

            obj.spouse;

            expect(count(anyAccess())).to.equal(1);
            expect(count(getFilter('spouse'))).to.equal(1);

            expect(count(anyAccess(),obj2)).to.equal(0);

            obj2.spouse;

            expect(count(anyAccess(),obj2)).to.equal(1);
        });

        it('property descriptor accessor methods will not be interfered with',function(){
            var val = 'bar';
            obj = {
                get foo(){return 'foo' + val},
                set foo(newVal){val = newVal;}
            };

            spyProp(obj,'foo');

            expect(obj.foo).to.equal('foobar');
            obj.foo = 'baz';
            expect(obj.foo).to.equal('foobaz');
        });



        it('non-configurable will throw',function(){
            obj = {};
            var val = 'bar';
            Object.defineProperty(obj,'foo',{
                get:function(){
                    return 'foo' + val;
                },
                set:function(newVal){
                    val = newVal;
                    return 'foo' + val;
                },
                configurable:false
            });

            expect(function(){spyProp(obj,'foo')}).to.throw();
        });


        it('restore returns descriptor to normal',function(){
            var obj = {foo:'bar'};
            expect(Object.getOwnPropertyDescriptor(obj,'foo').value).to.not.be.undefined;
            spyProp(obj,'foo');
            expect(Object.getOwnPropertyDescriptor(obj,'foo').value).to.be.undefined;
            obj.___propertySpyCollection.restore();
            expect(Object.getOwnPropertyDescriptor(obj,'foo').value).to.not.be.undefined;
        });


        it('non-readable properties will not have a get method as a spy',function(){
            obj = {};
            var i = 0, val;
            Object.defineProperty(obj,'foo',{set:function(_val){i++; val = _val;},configurable:true});
            spyProp(obj,'foo');
            expect(Object.getOwnPropertyDescriptor(obj,'foo').get).to.be.undefined;
        });


        it('non-writable accessor properties will not have a set method as a spy',function(){
            obj = {};
            var i = 0;
            Object.defineProperty(obj,'foo',{get:function(){return i++;},configurable:true});
            spyProp(obj,'foo');
            expect(Object.getOwnPropertyDescriptor(obj,'foo').set).to.be.undefined;
        });


        it('non-writable value properties will not have a set method as a spy',function(){
            obj = {};
            var i = 0;
            Object.defineProperty(obj,'foo',{value:'hello',configurable:true});
            spyProp(obj,'foo');
            expect(Object.getOwnPropertyDescriptor(obj,'foo').set).to.be.undefined;

            obj.___propertySpyCollection.restore();
        });

        it('you can spy multiple properties on an object',function(){
            obj = {a:1,b:2};
            spyProp(obj,'a');
            spyProp(obj,'b');

            expect(count(getFilter())).to.equal(0);
            obj.a;
            obj.b;
            expect(count(getFilter())).to.equal(2);
        });

        it('spying a second property should use the same spycollection and just add to it',function(){
            obj = {a:1,b:2};
            var collection1 = spyProp(obj,'a'), collection2 = spyProp(obj,'b');
            expect(collection1).to.equal(collection2);

        });

        it('understanding getters and setters',function(){
            //missing getter/setter doesn't cause any errors to be thrown if you try to read / write the propery
            //nothing happens.

            var noGetter = {set foo(val){}}, noSetter = {get foo(){return ''}};
            expect(noGetter['foo']).to.be.undefined;

            noSetter['foo'] = 'a value';

            expect(noSetter.foo).to.equal('');

            var unwritable = {};

            Object.defineProperty(unwritable,'foo',{value:'bar',writable:false});

            unwritable.foo = "hello";
            expect(unwritable.foo).to.equal('bar');
        });

        it('understanding property descriptors - they don\'t propagate value',function(){
            var meObj = {x:'hello'};
            Object.getOwnPropertyDescriptor(meObj,'x').value = 'goodbye';
            expect(meObj.x).to.equal('hello');
        });



        it('watcher is not enumerated')

    });
}

);
