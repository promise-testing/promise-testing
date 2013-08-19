;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("promise-testing/index.js", function(exports, require, module){

var utils = require('./lib/handler-utils.js');
var Properties = require('./lib/properties.js');
var PropertyListeners = require('./lib/property-listeners.js');
var Context = require('./lib/context.js');
var ChaiFlavor = require('./lib/chai-flavor.js');

module.exports = require('./lib/promise-testing.js')(utils,Properties,PropertyListeners,Context,ChaiFlavor);
});
require.register("promise-testing/lib/chai-flavor.js", function(exports, require, module){
function ChaiFlavor(chai){
    'use strict';


    var Assertion = chai.Assertion,
        proto = Assertion.prototype,
        expect = chai.expect,
        excludeNames = /^(?:length|name|arguments|caller|constructor)$/,
        ignoreProps = /^(?:to|be)$/,
        resultProps = /^(?:result(?:s|ed)?)$/,
        rejectProps = /^(?:reject(?:ed|ion)?)$/,
        fakeInstance = {assert:function(){}};

    function ExpectHandler(propName,tools){
        var self = this,
            remove =  tools.addPropertyListener(function(propName,result){
                if(ignoreProps.test(propName))return;
                remove();

                if(resultProps.test(propName)){
                    self.type = 'result';
                } else if(rejectProps.test(propName)) {
                    self.type = 'reject'
                }
            });
        this.recordExecution = function(){
            remove();
            this.args = arguments;
        }
    }
    ExpectHandler.prototype.playback = function(lastResult,next,ctx){
        var args;
        switch(this.type){
            case 'result':
                if(ctx.type !== 'result'){
                    throw new chai.AssertionError('expected result but got rejection: ' + ctx.reason);
                }
                args = [ctx.result];
                break;
            case 'reject':
                if(ctx.type !== 'reject'){
                    throw new chai.AssertionError('expected rejection but got result: ' + ctx.result);
                }
                args = [ctx.reason];
                break;
            default :
                args = this.args;
        }
        next(expect.apply(null,args));
    };

    function NotifyDone(){
    }
    NotifyDone.prototype.recordExecution = function(done){
        this.done = done;
    };
    NotifyDone.prototype.playback = function(lastResult,next,ctx){
        if(ctx.reason){
            this.done(ctx.reason);
        }
        else {
            this.done();
        }
        next(null);
    };


    return function(properties,handlers){
        properties.addProperty('expect',ExpectHandler);
        properties.addProperty('notify',NotifyDone);

        ['reject','result','rejected','become','with','rejection'].forEach(function(val){
            properties.addProperty(val,handlers.noOpHandler);
        });

        Object.getOwnPropertyNames(proto).forEach(function(propName){
            if(!(properties.hasProperty(propName) || excludeNames.test(propName))){
                var descriptor = Object.getOwnPropertyDescriptor(proto,propName);
                if(descriptor.configurable){
                    var type;
                    if(descriptor.get){
                        try {
                            type = typeof descriptor.get.apply(fakeInstance);
                        }
                        catch(e){}
                    }
                    else if(descriptor.hasOwnProperty('value')){
                        type = typeof descriptor.value;
                    }

                    var handler = type === 'function' ? handlers.executableEchoHandler : handlers.echoHandler;
                    properties.addProperty(propName,handler);
                }
            }
        });

    };

}

module.exports = ChaiFlavor;

});
require.register("promise-testing/lib/context.js", function(exports, require, module){
function callStack(stack,ctx){
    var index = 0;
    function next(_result){
        if(index == stack.length){
            index++;
            return;
        }
        stack[index++].playback(_result,next,ctx);
    }
    next(null);
    index--;
    if(index != stack.length){
        throw Error(stack[index].propName + ' at index ' + index + ' did not call next');
    }
    return ctx.doReturn();
}

function Context(type,value){
    switch(type){
        case 'reject':
            this.reason = value;
            break;
        case 'result':
            this.result = value;
            break;
    }

    this.type = type;
    this.returnValue = value;

    this.doReturn = function doReturn(){
        return this.returnValue;
    }
}

function createExecutionArgs(stack){
    return [
        function(result){return callStack(stack,new Context('result',result));},
        function(reason){return callStack(stack,new Context('reject',reason));}
    ];
}

Context.createExecutionArgs = createExecutionArgs;
Context.callStack = callStack;

module.exports = Context;

});
require.register("promise-testing/lib/handler-utils.js", function(exports, require, module){

function isArray(arr){
    return Object.prototype.toString.call( arr ) === '[object Array]';
}

function buildHandler(definition){
    var constructor = definition.constructor,
        recordExecution = definition.recordExecution,
        playback = definition.playback;

    function Constructor(){
        if(constructor) constructor.apply(this,arguments);
    }

    if(recordExecution == true){
        recordExecution = function(){this.args = Array.prototype.slice.call(arguments);};
    }
    else if(isArray(recordExecution)){
        var array = recordExecution;
        recordExecution = function(){
            for(var i = 0, l = array.length; i < l; i++){
                this[array[i]] = arguments[i];
            }
        }
    }

    Constructor.prototype.recordExecution =  recordExecution;
    Constructor.prototype.playback = playback;

    return Constructor;
}

var echoHandler = buildHandler({
    recordExecution:false,
    playback:function (lastResult,next){
        next(lastResult[this.propName]);
    }
});

var executableEchoHandler = buildHandler({
    recordExecution:true,
    playback:function(lastResult,next){
        var result = lastResult[this.propName];
        if(this.args){
            result = result.apply(lastResult,this.args);
        }
        next(result);
    }
});

var noOpHandler = buildHandler({playback:function noOpExecute(lastResult,next){next(lastResult);}});



module.exports = {
    buildHandler:buildHandler,
    echoHandler:echoHandler,
    executableEchoHandler:executableEchoHandler,
    noOpHandler:noOpHandler
};


});
require.register("promise-testing/lib/promise-testing.js", function(exports, require, module){

function inject(utils,Properties,PropertyListeners,Context,ChaiFlavor){


function PromiseTester(){
    var properties = new Properties();

    var muteActions = false, isWrapped = false;

    function wrapPromise(promise){
        promise.then = _wrapPromise(promise,promise.then);
        return promise;
    }

    function _wrapPromise(promise,then){

        var stack,listeners, nextPromise,
            currentExecutionHandler = simpleThenCall;

        function execute(){
            return currentExecutionHandler.apply(null,arguments);
        }

        function simpleThenCall(){
            return wrapPromise(then.apply(promise,arguments));
        }

        function createAndPushHandler(propName){
            if(!stack){
                stack = [];
                listeners = new PropertyListeners();
                nextPromise = then.apply(promise,Context.createExecutionArgs(stack));
            }
            listeners.notifyPropertyAdded(propName);
            var handler = properties.createHandler(propName,listeners);
            currentExecutionHandler = handler.recordExecution
                ? function(){
                    handler.recordExecution.apply(handler,arguments);
                    return execute;
                }
                : function() {throw Error('property ' + propName + ' can not be executed');};
            stack.push(handler);
            return execute;
        }

        function addChainableGetter(propName,onGet){
            Object.defineProperty(execute,propName,{
                get:function(){
                    return onGet(propName);
                },
                configurable:true
            });
        }

        addChainableGetter('then',function(){
            if(muteActions){
                isWrapped = true;
                return execute;
            }
            //return wrapPromise(nextPromise).then;
            if(nextPromise){
                return wrapPromise(nextPromise).then;
            }
            else {
                return execute;
            }
        });

        properties.getPropertyNames().forEach(function(propName){
            addChainableGetter(propName,createAndPushHandler);
        });

        return execute;
    }

    function isWrappedFunction(promise){
        isWrapped = false;
        muteActions = true;
        try {
            var firstThen = promise && promise.then;
            if(typeof firstThen !== 'function'){
                throw new Error(promise + ' is not a promise');
            }
            firstThen.then;
            return isWrapped;
        }
        finally {
            muteActions = false;
        }
    }

    this.isWrapped = isWrappedFunction;

    function wrap(promise){
      /*  if(isWrappedFunction(promise)){
            return promise;
        }      */
        return wrapPromise(promise);
    }

    this.wrap = wrap;

    function wrapf(fn){
        return function(){return wrap(fn.apply(this,arguments))};
    }

    this.wrapf = wrapf;

    this.patch = function(obj,prop){
        if(!obj || typeof obj[prop] !== 'function') throw Error('Obj must exist and obj[prop] must be a function');
        obj[prop] = wrapf(obj[prop]);
    };

    function use(fn){
        fn(properties,utils);
    }

    this.use = use;

    this.scanChai = function (chai) {
        use(ChaiFlavor(chai));
    }
}
    return PromiseTester;

}

module.exports = inject;
});
require.register("promise-testing/lib/properties.js", function(exports, require, module){
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

});
require.register("promise-testing/lib/property-listeners.js", function(exports, require, module){
function PropertyListeners(){
    var listeners = [];

    this.notifyPropertyAdded = function(propName){
        listeners.slice().forEach(
            function(listener){
                listener.propertyAdded(propName)
            }
        );
    };

    this.addPropertyListener = function(fn){
        return new PropertyListener(fn).remove;
    };

    function PropertyListener (fn){
        var self = this;

        listeners.push(this);

        this.remove = function(){
            for (var i = 0; i < listeners.length; i++) {
                if(self === listeners[i]){
                    listeners.splice(i,i+1);
                    return;
                }
            }
        };

        this.propertyAdded = function(propName){
            fn(propName);
        }
    }
}

module.exports = PropertyListeners;

});
require.alias("promise-testing/index.js", "promise-testing/index.js");if (typeof exports == "object") {
  module.exports = require("promise-testing");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("promise-testing"); });
} else {
  this["PromiseTesting"] = require("promise-testing");
}})();