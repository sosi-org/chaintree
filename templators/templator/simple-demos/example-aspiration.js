'use strict';
'use strict';

// untested psudo-code

const trequire = require('templator-require');

const b64 = trequire('base64');
const t = b64();
t.generate();

const auto_test_templators = [
  {
    // namespace/name
    name: 'base64',
  }
];

function each_case(tname) {
  global.templatorsconf.reverberate = false;

  const t = trequire(tname);
  const instance = t();
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

// todo: commandline for each templator. testt base64;testt b64url;
