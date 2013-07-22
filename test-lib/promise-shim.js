
var isNode = process && process.env;

if(isNode){
    if(process.env.USE_WHEN_PROMISES){
        console.log("USING WHEN PROMISES");
        module.exports=require('when');
    }
    else {
        console.log("USING Q PROMISES");
        module.exports = require('q');
    }
}
else {
    console.log("USING Q PROMISES");
    module.exports = require('q');
}