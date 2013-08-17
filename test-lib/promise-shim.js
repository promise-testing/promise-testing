if(typeof process !== 'undefined' && process && process.env && process.env.USE_WHEN_PROMISES){
    console.log("USING WHEN PROMISES");
    module.exports=require('when');
}
else {
    console.log("USING Q PROMISES");
    module.exports = require('q');
}