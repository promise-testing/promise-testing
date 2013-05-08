({
    appDir: "lib/",
    baseUrl: ".",
    dir: "build/",
    paths: {
        'chai': '../node_modules/chai/chai'
    },
    optimize:'none',
    modules: [
        {
            name: "chai-flavor",
            exclude:['chai']
        }
    ]
})
