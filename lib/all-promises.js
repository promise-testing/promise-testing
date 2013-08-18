
function AllPromises(){
    var count = 0;

    var fn;

    function doError(propName,index,message){
        throw new Error(propName + '[' + index + ']: ' + message)
    }

    function tick(){
        if(count == 0){
            if(fn){
                fn();
            }
        }
    }

    function wrapIfPromise(p,propName,index){
        if(p)  {
            var then = p.then;
            if(typeof then === 'function'){
                count++;
                var finished, resolved, value;
                then.call(p,
                    function(result){
                        if(finished) doError(propName,index,'called more than once (' + value + ',' + result + ')');
                        count--;
                        finished = resolved = true;
                        value = result;
                        tick();
                    },
                    function(reason){
                        if(finished) doError(propName,index,'called more than once (' + value + ',' + reason + ')');
                        count--;
                        finished = true;
                        resolved = false;
                        value = reason;
                        tick();
                    });
                return function(){
                    if(!finished){
                        doError(propName,index,'called before it\'s time');
                    }
                    if(resolved){
                        return value;
                    }
                    else {
                        throw value;
                    }
                }
            }
        }
        return function(){return p};
    }

    function run(_fn){
        return function(resulted){
            return {
                then:function(onResolve,onReject){
                    fn = function(){
                        var result;
                        try {
                            result = _fn(resulted);
                        }
                        catch(e){
                            onReject(e);
                            return;
                        }
                        onResolve(result);
                    };
                    tick();
                }
            }
        }
    }

    this.wrapIfPromise = wrapIfPromise;
    this.run = run;
}

module.exports = AllPromises;