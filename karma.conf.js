// Karma configuration

module.exports = function(config){

    //var config = {};


    // base path, that will be used to resolve files and exclude
    config.basePath = '';

    config.frameworks = ['mocha'];

    // list of files / patterns to load in the browser

    var coverage = process.env.PROMISE_TESTING_COV;

    if(coverage){
        config.files = [
            'build/test-build-coverage.js',
            'build/test-loader-coverage.js'
        ];
    }
    else {
        config.files = [
            'build/test-build.js',
            'build/test-loader.js'
        ];
    }

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
    config.logLevel = config.LOG_INFO;


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
    config.browsers = ['Chrome', 'Firefox','Safari'];

    // If browser does not capture in given timeout [ms], kill it
    config.captureTimeout = 60000;


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    config.singleRun = true;


    //config_object.set(config);
};