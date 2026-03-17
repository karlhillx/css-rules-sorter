.PHONY: install test lint format clean build

install:
	npm install

test:
	npm test

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf node_modules
	rm -rf coverage

build: lint test
	@echo "Build successful"
