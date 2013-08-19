var fs = require('fs');
var semver = require('semver');
var pkg = require('./package.json');
var bower = require('./bower.json');
var component = require('./component.json');

var type = process.env.PT_SEMVER_INC_TYPE

var version = pkg.version;

if(!semver.valid(version)){
    throw new Error(version + ' in package.json is not a valid version');
}

version = semver.inc(version,type);

if(!version){
    throw new Error('Problem updating version. Version: ' + pkg.version + ', Increment Type: ' + type);
}


if(pkg.version != version){
    pkg.version = version;
    fs.writeFileSync('./package.json',JSON.stringify(pkg,2,2));
}
if(bower.version != version){
    bower.version = version;
    fs.writeFileSync('./bower.json',JSON.stringify(bower,2,2));
}
if(component.version != version){
    component.version = version;
    fs.writeFileSync('./component.json',JSON.stringify(component,2,2));
}