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
       var obj =  {
           playback:function(){
               handler.playback.apply(handler,arguments);
           },
           propName:propName
       };
       if(handler.recordExecution){
           obj.recordExecution = function(){
               var args = [];
               for(var i = 0; i < arguments.length; i++){
                   args[i] = tools.wrapIfPromise(arguments[i],propName,i);
               }
               handler.recordExecution.apply(handler,args);
           }
       }
       return obj;
   }

   this.addProperty = addProperty;
   this.createHandler = createHandler;
   this.getPropertyNames = Object.getOwnPropertyNames.bind(null,thenPropertyHandlers);
   this.hasProperty = thenPropertyHandlers.hasOwnProperty.bind(thenPropertyHandlers);
}

module.exports = Properties;
