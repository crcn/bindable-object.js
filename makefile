ALL_TESTS = $(shell find ./test -name "*-test.js")
REPORTER=dot
ONLY="."
NAME=big-list
TIMEOUT=1000


test-node:
	PC_DEBUG=1 ./node_modules/.bin/mocha $(ALL_TESTS) --ignore-leaks --timeout $(TIMEOUT) --reporter $(REPORTER)

parser:
	mkdir -p ./lib/parser
	./node_modules/.bin/pegjs ./src/parser/grammar.peg ./lib/parser/parser.js

parser-watch: parser
	fswatch ./src/parser/grammar.peg | xargs -n1 make parser

test-watch:
	PC_DEBUG=1 mocha $(ALL_TESTS) --recursive --reporter $(REPORTER) -b -g $(ONLY) --timeout $(TIMEOUT) --watch ./test ./lib

test-cov:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha $(ALL_TESTS) -- --reporter $(REPORTER) --timeout $(TIMEOUT)

test-coveralls:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha $(ALL_TESTS) -- --timeout $(TIMEOUT) --reporter $(REPORTER)  && \
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls --verbose

test-karma:
	./node_modules/karma/bin/karma start