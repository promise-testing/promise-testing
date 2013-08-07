var bower = require('./bower.json');
var pkg = require('./package.json');
if(bower.version != pkg.version){
    var fs = require('fs');
    bower.version = pkg.version;
    fs.writeFileSync('./bower.json',JSON.stringify(bower,2,2));
}