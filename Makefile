SRC ?= lib
TESTS = test

NAME ?= $(shell node -e 'console.log(require("./package.json").name)')
VERSION ?= $(shell node -e 'console.log(require("./package.json").version)')

NODE ?= $(shell which node)
NPM ?= $(shell which npm)
JSHINT ?= node_modules/jshint/bin/jshint
MOCHA ?= node_modules/mocha/bin/mocha
REPORTER ?= spec
NODEMON ?= node_modules/nodemon/bin/nodemon.js

all: dev lint test safe

test:
	@echo -----------------
	@echo - RUNNING TESTS -
	@echo -----------------
	$(NODE) $(MOCHA) --reporter $(REPORTER) $(TESTS)

test-dev:
	@echo ---------------------------------------------
	@echo - TESTS AUTOMATICALLY RERUN ON FILE CHANGES -
	@echo ---------------------------------------------
	$(NODE) $(MOCHA) $(TESTS) --reporter $(REPORTER) --watch $(SRC)

dev:
	@echo -----------------------
	@echo - INSTALLING DEV DEPS -
	@echo -----------------------
	$(NPM) install

lint:
	@echo ------------------
	@echo - LINTING SOURCE -
	@echo ------------------
	$(NODE) $(JSHINT) $(SRC)

	@echo -----------------
	@echo - LINTING TESTS -
	@echo -----------------
	$(NODE) $(JSHINT) $(TESTS)

safe:
	nsp check

release: lint test safe
	@echo ------------------------------------------
	@echo - ready to bump versions and npm release -
	@echo ------------------------------------------

coverage:
	$(NPM) install istanbul
	node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -- test/*.js test/integration/*.js --reporter spec

.PHONY: dev lint test test-dev integration-test build build-dev
