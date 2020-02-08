'use strict';

function* example_generator() {
  yield {output: null, input: Buffer.from('abc'), params: ['./templators/tests/simple-test-file.txt'] };
}

module.exports = example_generator;
