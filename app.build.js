({
    appDir: "lib/",
    baseUrl: ".",
    dir: "build/tmp",
    paths: {
        'chai': '../node_modules/chai/chai'
    },
    optimize:'none',
    uglify2:{
        output:{
            beautify:true
        }
    },
    modules: [

        {
            name: "promise-testing"
        },
        {
            name: "chai-flavor",
            exclude:['chai'],
            out:"build/chai-flavor.js"
        }
    ]
})
