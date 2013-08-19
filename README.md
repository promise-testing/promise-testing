[![browser support](https://ci.testling.com/USER/PROJECT.png)](https://ci.testling.com/USER/PROJECT)
Promise Testing [![Build Status](https://travis-ci.org/promise-testing/promise-testing.png)](https://travis-ci.org/promise-testing/promise-testing)[![Dependency Status](https://david-dm.org/promise-testing/promise-testing.png)](https://david-dm.org/promise-testing/promise-testing)[![devDependency Status](https://david-dm.org/promise-testing/promise-testing/dev-status.png)](https://david-dm.org/promise-testing/promise-testing#info=devDependencies)
===============

**A testing library for then-able promises.**

* Implementation independent. Should work with any [Promise/A+](http://promises-aplus.github.io/promises-spec/) conformant library. (Test suite runs against [Q](https://github.com/kriskowal/q) and [When](https://github.com/cujojs/when)).
* Runs in [Node](http://nodejs.org) or directly in the browser.
* Support for [NPM](https://npmjs.org/) and [Component](https://github.com/component/component) package managers.
* Test/Assertion framework agnostic. Support for [Mocha](http://visionmedia.github.io/mocha/) and [Chai](http://chaijs.com/) built in.

Quick Start
===========

See the [example](https://github.com/promise-testing/promise-testing/blob/master/examples/example-test.js);

Usage
=====

Create a new test engine.
-------------------------

Node.js or Component
```javascript
var PromiseTesting = require('promise-testing');
var engine = new PromiseTesting();
```

In the browser (included via script tag)
```javascript
var engine = new PromiseEngine();
```

Add Chai Support.
-----------------

If you are using any chai extensions (i.e. [SinonChai](https://github.com/domenic/sinon-chai)) **before** calling the scanChai method.

```javascript
engine.scanChai(chai);
```

Wrap Promises or Patch Methods.
-------------------------------

Promises need to be wrapped by a wrapper object for testing.

```javascript
var rawPromise = someService.createPromise();
var wrappedPromise = engine.wrap(rawPromise);
```

Functions that always return promises can be `patched` for convenience
```javascript
engine.patch(someService,'createPromise');
//all calls to the patched function now return a wrappedPromise
var wrappedPromise1 = someService.createPromise();
var wrappedPromise2 = someService.createPromise();
```

Expectations
------------

You can now use chai expectations just like you normally would, however they won't be run until the promise completes.

```javascript
wrappedPromise.then.expect.result.to.equal('hello').then.notify(done);
```
is equivalent to
```javascript
promise.then(function(result){
	expect(result).to.equal('hello');
}).then(
	function(){
		done(); //No Error - test passes
	},
	done //There was an error - pass it to done
);
```
