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

.PHONY: clean clean-all git-clean-show git-clean test test-fast test-performance test-browser default_build