// Karma configuration
// Generated on Sat Apr 27 2013 16:32:48 GMT-0400 (EDT)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
files = [
    MOCHA,
    MOCHA_ADAPTER,
    REQUIRE,
    REQUIRE_ADAPTER,
    'test-main-file.js',
    {pattern:'node_modules/chai/chai.js',included:false, watched:false},
    {pattern:'node_modules/chai-as-promised/lib/chai-as-promised.js',included:false, watched:false},
    {pattern:'node_modules/q/q.js',included:false, watched:false},
    {pattern:'node_modules/sinon/pkg/sinon.js',included:false, watched:false},
    {pattern:'node_modules/chai-as-promised/lib/chai-as-promised.js',included:false, watched:false},
    {pattern:'node_modules/sinon-chai/lib/sinon-chai.js',included:false, watched:false},
    {pattern:'test/**/*test.js', included:false},
    {pattern: 'lib/**/*.js', included: false}
];


// list of files to exclude
exclude = [
    'test/performance-test.js',
    '**/*nobrowser.js'
];


preprocessors = {
    'lib/*.js':'coverage'
};

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['dots','growl','coverage'];

coverageReporter = {
    type :'html',
    dir :'coverage/'
};

// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome', 'Firefox', 'Safari'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
