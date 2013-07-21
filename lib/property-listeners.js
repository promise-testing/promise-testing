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
