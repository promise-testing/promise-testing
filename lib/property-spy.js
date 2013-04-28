//RequireJS && NodeJS Define Boilerplate
({ define: typeof define === "function" ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).

define([],function(){
        var locked;

        function PropertySpy(callback,obj,prop){
            var index = 0,
                value = obj[prop];
            delete obj[prop];

            function logAccess(isGet,value,newValue){
                callback(prop,isGet,value,newValue,index++);
            }

            Object.defineProperty(obj,prop,{
                enumerable:true,
                get:function(){
                    if(!locked){
                        logAccess(true,value);
                    }
                    return value;
                },
                set:function(newVal){
                    if(!locked){
                        logAccess(false,value,newVal);
                    }
                    return value = newVal;
                }
            });
        }

        function PropertySpyCollection(obj){
            if(obj.___propertySpyCollection) throw Error('Already instantiated on %j',obj);

            var self = this, propertySpies = {}, log = [];

            Object.defineProperty(obj,'___propertySpyCollection',{
                value:self,
                enumerable:false
            });

            function addSpy (prop){
                return  propertySpies[prop] || (propertySpies[prop] = new PropertySpy(logAccess,obj,prop));
            }

            this.addSpy = addSpy;

            function logAccess(prop,isGet,value,newValue,propIndex){
                try {
                    if(locked) throw Error('logAccess should not be called while locked');
                    locked = true;
                    var valueJSON, newValueJSON = valueJSON = 'Circular Reference Error';
                    try{
                        valueJSON = JSON.stringify(value);
                    } catch(e){
                    }
                    try{
                        newValueJSON = JSON.stringify(newValue);
                    } catch(e){
                    }

                    log.push(
                        {
                            prop:prop,
                            objectAccessIndex:log.length,
                            propertyAccessIndex:propIndex,
                            isGet:isGet,
                            type: isGet ? 'get' : 'set',
                            valueRef: value,
                            valueJSON: valueJSON,
                            newValueRef: newValue,
                            newValueJSON: newValueJSON
                        }
                    );
                } finally {
                    locked = false;
                }
            }

            function count(filter){
                var ct = 0;
                log.forEach(function(val){
                    if(filter(val)) ct++;
                });
                return ct;
            }

            function copyLog(logItem){
                return {
                    prop:logItem.prop,
                    objectAccessIndex:logItem.objectAccessIndex,
                    propertyAccessIndex:logItem.propertyAccessIndex,
                    isGet:logItem.isGet,
                    type: logItem.type,
                    valueRef: logItem.valueRef,
                    valueJSON: logItem.valueJSON,
                    newValueRef: logItem.newValueRef,
                    newValueJSON: logItem.newValueJSON
                }

            }

            function get(filter){
                var copies = [];
                log.forEach(function(val){
                    if(filter(val)){
                        copies.push( copyLog(val));
                    }
                });
                return copies;
            }

            this.count = count;
            this.get = get;
        }

        return function spyProp(obj,prop){
            var collection = obj.___propertySpyCollection;
            if(!collection){
                collection = new PropertySpyCollection(obj);
            }
            for(var i = 1; i < arguments.length; i ++){
                collection.addSpy(arguments[i]);
            }
        };
    }
);

