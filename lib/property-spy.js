if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([],
function(){
    'use strict';

        var locked;

        function PropertySpy(callback,obj,prop){

            var value,
                index = 0,
                oldDescriptor = Object.getOwnPropertyDescriptor(obj,prop),
                hasGetter = typeof oldDescriptor.get !== 'undefined',
                hasSetter = typeof oldDescriptor.set !== 'undefined',
                isAccessor = hasGetter || hasSetter,
                writable = oldDescriptor.writable || hasSetter,
                readable = (!isAccessor) || hasGetter,
                enumerable = !!oldDescriptor.enumerable,
                configurable = !!oldDescriptor.configurable;

            if(!configurable) throw Error('Attempt to spy on un-configurable property ' + prop);

            if(!isAccessor) value = oldDescriptor.value;

            var descriptor = {
                enumerable:enumerable,
                configurable:true
            };

            if(readable){
                descriptor.get = function(){
                    if(isAccessor) value = oldDescriptor.get.call(obj);
                    if(!locked){
                        logAccess(true,value);
                    }
                    return value;
                }
            }

            if(writable){
                descriptor.set = function(newVal){
                    if(!locked){
                        logAccess(false,value,newVal);
                    }
                    value = newVal;
                    if(isAccessor) oldDescriptor.set.call(obj,value);
                }
            }

            Object.defineProperty(obj,prop,descriptor);

            function logAccess(isGet,oldValue,newValue){
                callback(prop,isGet,oldValue,newValue,index++);
            }

            this.restore = function(){
                Object.defineProperty(obj,prop,oldDescriptor);
                if(!isAccessor && writable) obj[prop] = value;
            }
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


            function logAccess(prop,isGet,oldValue,newValue,propIndex){
                try {
                    if(locked) throw Error('logAccess should not be called while locked');
                    locked = true;

                    log.push(
                        {
                            prop:prop,
                            objectAccessIndex:log.length,
                            propertyAccessIndex:propIndex,
                            isGet:isGet,
                            type: isGet ? 'get' : 'set',
                            oldValue: oldValue,
                            newValue: newValue
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

            function get(filter){
                var copies = [];
                log.forEach(function(val){
                    if(filter(val)){
                        copies.push(val);
                    }
                });
                return copies;
            }

            this.count = count;
            this.get = get;
            this.addSpy = addSpy;
            this.restore = function(){
                for(var i in propertySpies){
                    if(propertySpies.hasOwnProperty(i)){
                        propertySpies[i].restore();
                        delete propertySpies[i];
                    }
                }
                delete obj.___propertySpyCollection;
            }
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

