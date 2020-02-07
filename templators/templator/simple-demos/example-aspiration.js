'use strict';
'use strict';

// untested psudo-code
/*
TODO:
const trequire = require('templator-require');

OR: (not good)
const templator = require('templator-require');
const b64 = teamplator('base64');

*/

const {requiret} = require('../../requiret');
const trequire = requiret;

global.templatorsconf =  {
  reverberate: false,
}

/*
TODO: usage:
const b64 = trequire('base64');
const t = b64();
*/
const {Base64} = trequire('base64');
const b64 = Base64;
const t = new b64();

t.generate('sample string');

const auto_test_templators = [
  {
    // namespace/name
    name: 'base64',
  }
];

function each_case(tname) {
  global.templatorsconf.reverberate = false;

  console.log('going for: ', tname);

  const t = trequire(tname);
  const instance = new t();
  const ex1_trequire_example_geenrator = trequire_examples(tname);
  while (true) {
    const {example, expected} = ex1_trequire_example_geenrator.get_next_pair(); // make it more yeild-y. Or async.
    if (!example) {
      break;
    }
    const output = instance.generate(example);
    chai.expect(output).eql(expected);

    // reverse
    const o2 = instance.generate(output);
    // idempotence
    // ?
  }
  // check documentations, etc
}

auto_test_templators.forEach( tname => each_case(tname.name) );

// todo: commandline for each templator. testt base64;testt b64url;
