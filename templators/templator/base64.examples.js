'use strict';

// a generator for examples

function promise_value(value) {
  return new Promise((accept, reject) => {
      accept(value);
  })
}

const pv = promise_value;

module.exports = async () => [pv('string'), pv(''), pv('یونیکد')];
