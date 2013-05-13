
node_modules: package.json
	@npm install

promise-testing.js: node_modules lib/*
	@./node_modules/.bin/r.js -o app.build.js

promise-testing.min.js: node_modules lib/*
	@./node_modules/.bin/r.js -o app.build.js optimize=uglify2

clean:
	@rm -rf build
	@rm -rf coverage

clean-all: clean
	@rm -rf node_modules
	
test: node_modules
	@mocha --reporter spec
	
test-fast: node_modules
	@mocha --reporter spec --grep @slow --invert

.PHONY: clean clean-all test test-fast