// Karma configuration

module.exports = function(config){
    console.log("CONFIGURING KARMA");

    //var config = {};


    // base path, that will be used to resolve files and exclude
    config.basePath = '';

    config.frameworks = ['mocha'];

    // list of files / patterns to load in the browser

    var coverage = process.env.PROMISE_TESTING_COV;
    var when = process.env.USE_WHEN_PROMISES;

    var files = [];

    if(when){
        console.log("USING WHEN PROMISES**")
        files.push('when-environment.js');
    }


    if(coverage){
        files = files.concat([
            'build/test-build-coverage.js',
            'build/test-loader-coverage.js'
        ]);
    }
    else {
        files = files.concat([
            'build/test-build.js',
            'build/test-loader.js'
        ]);
    }

    console.log(files);

    config.files = files;

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit'
    config.reporters = ['dots','growl'];

    if(coverage){
        config.reporters.push('coverage');
        config.coverageReporter = {
            type : 'html',
            dir : 'coverage/'
        };
    }

    // web server port
    config.port = 9876;


    // cli runner port
    config.runnerPort = 9100;


    // enable / disable colors in the output (reporters and logs)
    config.colors = true;


    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    config.logLevel = config.LOG_WARN;


    // enable / disable watching file and executing tests whenever any file changes
    config.autoWatch = true;


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)

    var browsers = ['Chrome'];
    /*var browsers = ['PhantomJS'];

    if(process.platform == 'darwin'){
        browsers = browsers.concat(['Chrome','Firefox','Safari']);
    }
    else {
        console.log(process.platform);
    }     */

    config.browsers = browsers;


    // If browser does not capture in given timeout [ms], kill it
    config.captureTimeout = 60000;


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    config.singleRun = false;


    //config_object.set(config);
};