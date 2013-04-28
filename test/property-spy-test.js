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
                return val.isGet && (val.prop == prop);
            }
        }

        function setFilter(prop){
            return function(val){
                return (!val.isGet) && (val.prop == prop);
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

           // console.log(getLogs());



        });

    });
}

);
