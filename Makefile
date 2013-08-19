REPORTER=dot
TIMEOUT=200
INC=patch

ifeq ($(WATCH),true)
	KARMA_RUN_FLAG=--no-single-run
else
	KARMA_RUN_FLAG=--single-run
endif

default_build: test test-browser test-browser-when

node_modules: package.json
	@echo "Installing Node Dependencies"
	@npm install
	@touch node_modules

components: node_modules component.json
	@echo "Installing Component Dependencies"
	@./node_modules/.bin/component-install --dev
	@touch components

build/test-build.js: components lib/* test/* test-lib/* slow-tests/*
	@echo "Compiling component test-build"
	@./node_modules/.bin/component-test-build

clean:
	@echo "Cleaning up build artifacts"
	@rm -rf build
	@rm -rf coverage
	@rm -rf coverage-stage
	@rm -rf lib-cov
	
test: test-core test-aplus test-performance

test-core: node_modules
	@mocha --reporter $(REPORTER) --timeout $(TIMEOUT)
	
test-performance: node_modules
	@echo "Running performance tests vs chai-as-promised"
	@mocha --reporter $(REPORTER) --timeout $(TIMEOUT) slow-tests/performance*.js

test-aplus: node_modules
	@echo "Testing that wrapped and chained promises conform to Promises/A+"
	@mocha --reporter $(REPORTER) --timeout $(TIMEOUT) slow-tests/chained*.js
	@echo "Testing that wrapped promises conform to Promises/A+"
	@mocha --reporter $(REPORTER) --timeout $(TIMEOUT) slow-tests/wrapped*.js
	
test-when: node_modules 
	@USE_WHEN_PROMISES=1 mocha --reporter $(REPORTER) --timeout $(TIMEOUT) 
	@echo "Testing that wrapped and chained promises conform to Promises/A+"
	@USE_WHEN_PROMISES=1 mocha --reporter $(REPORTER) --timeout $(TIMEOUT) slow-tests/chained*.js
	@echo "Testing that wrapped promises conform to Promises/A+"
	@USE_WHEN_PROMISES=1 mocha --reporter $(REPORTER) --timeout $(TIMEOUT) slow-tests/wrapped*.js
	@echo "Running performance tests vs chai-as-promised"
	@USE_WHEN_PROMISES=1 mocha --reporter $(REPORTER) --timeout $(TIMEOUT) slow-tests/performance*.js
	
test-browser: build/test-build.js node_modules/
	@echo "Testing In Browsers"
	./node_modules/.bin/karma start $(KARMA_RUN_FLAG)

test-browser-when: build/test-build.js node_modules
	@echo "Testing In Browsers (USING WHEN PROMISES)"
	@USE_WHEN_PROMISES=1 ./node_modules/.bin/karma start $(KARMA_RUN_FLAG)
	
test-everything: test test-when test-browser test-browser-when

test-browser-coverage: coverage-stage/build/test-build.js node_modules
	@echo "Testing In Browers (WITH COVERAGE)"
	@PROMISE_TESTING_COV=1 ./node_modules/.bin/karma start --single-run
	
lib-cov: lib/* node_modules
	@echo "Instrumenting source for code coverage."
	@./node_modules/.bin/istanbul instrument lib -o lib-cov

coverage-stage: components lib-cov
	@echo "Building Coverage Stage"
	@mkdir -p coverage-stage
	@mkdir -p build
	@ln -sf ../lib-cov coverage-stage/lib
	@ln -sf ../test coverage-stage/test
	@ln -sf ../test-lib coverage-stage/test-lib
	@ln -sf ../slow-tests coverage-stage/slow-tests
	@ln -sf ../components coverage-stage/components
	@ln -sf ../index.js coverage-stage/index.js
	@ln -sf ../component.json coverage-stage/component.json
	@ln -sf ../coverage-stage/build/test-build.js build/test-build-coverage.js
	@ln -sf ../coverage-stage/build/test-loader.js build/test-loader-coverage.js

coverage-stage/build/test-build.js: coverage-stage
	@echo "Compiling component test-build (WITH COVERAGE)"
	@cd coverage-stage; ../node_modules/.bin/component-test-build

promise-testing.js: components index.js lib/*
	@echo "Creating Standalone build"
	@./node_modules/.bin/component-build -s PromiseTesting
	@mv build/build.js promise-testing.js

docs: examples/*
	@echo "Creating docs"
	@./node_modules/.bin/docco -l parallel examples/*
	@touch docs

PKG_VERSION=$(shell node -e 'console.log(require("./package.json").version)')

release: promise-testing.js
	@echo "Updating From Version: ${PKG_VERSION}"
	@PT_SEMVER_INC_TYPE=${INC} node update-bower.js
	@sleep 3s
	$(eval NEW_VERSION=$(shell node -e 'console.log(require("./package.json").version)'))
	@echo "Updated To Version: ${NEW_VERSION}"
	@echo "Tagging and Pushing to GitHub"
	@git add bower.json
	@git add promise-testing.js
	@git add component.json
	@git add package.json
	@git commit -m "releasing v${NEW_VERSION}"
	@git tag -f -a v${NEW_VERSION} -m "tagging v${NEW_VERSION}"
	@git push
	@git push origin --tags
	@echo "Publishing to npm"
	@npm publish
	@echo "Cloning Bower Repo"
	@rm -rf promise-testing-bower
	@git clone git@github.com:promise-testing/promise-testing-bower
	@echo "Updating Bower Repo"
	@cp -f bower.json promise-testing-bower/bower.json
	@cp -f promise-testing.js promise-testing-bower/promise-testing.js
	@echo "Tagging And Pushing Bower Repo v${NEW_VERSION}" ;
	@if [ -d promise-testing-bower ] ; \
	then \
		cd promise-testing-bower ; \
		git add bower.json ; \
		git add promise-testing.js ; \
		git commit -m "releasing v${NEW_VERSION}" ; \
		git tag -f -a v${NEW_VERSION} -m "tagging v${NEW_VERSION}" ; \
		git push ; \
		git push origin --tags; \
	else \
		echo "ERROR: Bower Folder Wasnt There!" ; \
	fi;

.PHONY: clean clean-all git-clean-show git-clean 
.PHONY: test test-core test-performance test-aplus test-when test-browser test-browser-when test-everything
.PHONY: default_build promise-testing-bower bower push-bower release