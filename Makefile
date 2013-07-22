REPORTER=dot

ifeq ($(WATCH),true)
	KARMA_RUN_FLAG=--no-single-run
else
	KARMA_RUN_FLAG=--single-run
endif

default_build: test test-when

node_modules: package.json
	@echo "Installing Node Dependencies"
	@npm install
	@touch node_modules

components: component.json
	@echo "Installing Component Dependencies"
	@component install --dev

build/test-build.js: components lib/* test/* test-lib/*
	@echo "Compiling component test-build"
	@component test-build

clean:
	@echo "Cleaning up build artifacts"
	@rm -rf build
	@rm -rf coverage
	@rm -rf coverage-stage

clean-all: clean
	@echo "Cleaning up everything (including untracked dependencies)"
	@rm -rf node_modules
	@rm -rf components
	
git-clean-show:
	@git clean -n -d -x -e .idea/

git-clean:
	@git clean -f -d -x -e .idea/
	
test: node_modules
	@mocha --reporter $(REPORTER) --grep @performance --invert
	
test-when: node_modules
	@USE_WHEN_PROMISES=1 mocha --reporter $(REPORTER) --grep @performance --invert

test-fast: node_modules
	@mocha --reporter $(REPORTER) --grep @slow --invert

test-performance: node_modules
	@echo "Running performance tests vs chai-as-promised"
	@mocha --reporter $(REPORTER) --grep @performance
	
test-browser: build/test-build.js
	@echo "Testing In Browsers"
	@./node_modules/.bin/karma start $(KARMA_RUN_FLAG)

test-browser-when: build/test-build.js
	@echo "Testing In Browsers (USING WHEN PROMISES)"
	@USE_WHEN_PROMISES=1 ./node_modules/.bin/karma start $(KARMA_RUN_FLAG)


test-browser-coverage: coverage-stage/build/test-build.js
	@echo "Testing In Browers (WITH COVERAGE)"
	@PROMISE_TESTING_COV=1 ./node_modules/.bin/karma start --single-run
	
lib-cov: lib/*
	@echo "Instrumenting source for code coverage."
	@./node_modules/.bin/istanbul instrument lib -o lib-cov

coverage-stage: components lib-cov
	@echo "Building Coverage Stage"
	@mkdir -p coverage-stage
	@mkdir -p build
	@ln -sf ../lib-cov coverage-stage/lib
	@ln -sf ../test coverage-stage/test
	@ln -sf ../test-lib coverage-stage/test-lib
	@ln -sf ../components coverage-stage/components
	@ln -sf ../index.js coverage-stage/index.js
	@ln -sf ../component.json coverage-stage/component.json
	@ln -sf ../coverage-stage/build/test-build.js build/test-build-coverage.js
	@ln -sf ../coverage-stage/build/test-loader.js build/test-loader-coverage.js

coverage-stage/build/test-build.js: coverage-stage
	@echo "Compiling component test-build (WITH COVERAGE)"
	@cd coverage-stage; component test-build





.PHONY: clean clean-all git-clean-show git-clean test test-fast test-performance test-browser default_build