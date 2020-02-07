'use strict';

// a generator for examples
/*
function promise_value(value) {
  return new Promise((accept, reject) => {
      accept(value);
  })
}
const pv = promise_value;
module.exports = async () => [pv('string'), pv(''), pv('یونیکد')];
*/

/*
function* example_generator() {
  yield 'string';
  yield '';
  yield 'یونیکد';
}
*/

function* example_generator() {
  yield {output:'a string', input:'YSBzdHJpbmc='};
  yield {output: '', input: ''};
  yield {output: 'یونیکد', input: '24zZiNmG24zaqdiv'};
}

module.exports = example_generator;
