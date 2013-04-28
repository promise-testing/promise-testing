if(!(typeof require === "function" && typeof exports === "object" && typeof module === "object")){
    var tests = Object.keys(window.__karma__.files).filter(function (file) {
        if( /^\/base\/test\/.*test\.js$/.test(file)){
            console.log("GOOD TO GO: " + file);
            return true;
        }
        return false;
    });


    requirejs.config({
        // Karma serves files fr om '/base'
        baseUrl: '/base/',

        paths: {
            'chai': 'node_modules/chai/chai',
            'sinon': 'node_modules/sinon/pkg/sinon',
            'sinon-chai': 'node_modules/sinon-chai/lib/sinon-chai',
            'Q':'node_modules/q/q',
            'promise-testing':'promise-testing',
            'property-spy':'lib/property-spy'
        },
                         //asdfa
        shim: {
            'sinon': {
                exports: 'sinon'
            }
        },

        // ask Require.js to load these files (all our tests)
        deps: tests,

        // start test run, once Require.js is done
        callback: window.__karma__.start
    });
}