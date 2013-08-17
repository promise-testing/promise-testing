var bower = require('./bower.json');
var pkg = require('./package.json');
var component = require('./component.json');
if(bower.version != pkg.version){
    var fs = require('fs');
    bower.version = pkg.version;
    fs.writeFileSync('./bower.json',JSON.stringify(bower,2,2));
}
if(component.version != pkg.version){
    var fs = require('fs');
    component.version = pkg.version;
    fs.writeFileSync('./component.json',JSON.stringify(component,2,2));
}