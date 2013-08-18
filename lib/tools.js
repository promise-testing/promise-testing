var PropertyListeners = require('./property-listeners.js');
var AllPromises = require('./all-promises.js');

function Tools(){
    var propertyListeners = new PropertyListeners();
    var allPromises = new AllPromises();

    this.wrapIfPromise = allPromises.wrapIfPromise;
    this.run = allPromises.run;

    this.addPropertyListener = propertyListeners.addPropertyListener;
    this.notifyPropertyAdded = propertyListeners.notifyPropertyAdded;

}

module.exports = Tools;
