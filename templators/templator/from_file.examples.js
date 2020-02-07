'use strict';

function* example_generator() {
  yield {output: null, input: Buffer.from('abc') };
}

module.exports = example_generator;
