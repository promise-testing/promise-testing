default_build: test

node_modules: package.json
	@npm install

components: component.json
	echo "installing components"
	@component install --dev

build/test-build.js: components lib/*
	echo "Creating test-build"
	@component test-build

clean:
	@rm -rf build
	@rm -rf coverage
	@rm -rf coverage-stage

clean-all: clean
	@rm -rf node_modules
	@rm -rf components
	
git-clean-show:
	git clean -n -d -x -e .idea/

git-clean:
	git clean -f -d -x -e .idea/
	
test: node_modules
	@mocha --reporter spec --grep @performance --invert
	
test-fast: node_modules
	@mocha --reporter spec --grep @slow --invert

test-performance: node_modules
	@mocha --reporter spec --grep @performance
	
test-browser: build/test-build.js
	@karma start

test-browser-coverage: coverage-stage/build/test-build.js
	@karma start karma.coverage.conf.js
	
lib-cov: lib/*
	@echo "Instrumenting source for code coverage."
	@istanbul instrument lib -o lib-cov

coverage-stage: components lib-cov
	@mkdir -p coverage-stage
	@mkdir -p build
	@ln -s ../lib-cov coverage-stage/lib
	@ln -s ../test coverage-stage/test
	@ln -s ../components coverage-stage/components
	@ln -s ../index.js coverage-stage/index.js
	@ln -s ../component.json coverage-stage/component.json
	@ln -s ../coverage-stage/build/test-build.js build/test-build-coverage.js
	@ln -s ../coverage-stage/build/test-loader.js build/test-loader-coverage.js

coverage-stage/build/test-build.js: coverage-stage
	@cd coverage-stage; component test-build





.PHONY: clean clean-all git-clean-show git-clean test test-fast test-performance test-browser default_build