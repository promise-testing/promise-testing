function Properties() {
   var thenPropertyHandlers = {};

   function addProperty(prop,handler){
       if(thenPropertyHandlers[prop]) throw Error(prop + ' already defined');
       thenPropertyHandlers[prop] = handler;
   }

   function createHandler(propName,tools){
       var handler = new thenPropertyHandlers[propName](propName,tools);
       if(handler.propName ){
           if( handler.propName !== propName){
               throw Error('Handler for .' + propName + ' tried to set its own non-matching propName ' + handler.propName);
           }
       }
       else {
           handler.propName = propName;
       }
       return handler;
   }

   this.addProperty = addProperty;
   this.createHandler = createHandler;

    this.getPropertyNames = function(){
        return Object.getOwnPropertyNames(thenPropertyHandlers);
    };
    this.hasProperty = function(prop){
        return thenPropertyHandlers.hasOwnProperty(prop);
    };
}

module.exports = Properties;
