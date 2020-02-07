'use strict';

const chai = require('chai');

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
const b64 = trequire('base64').templator;
const t = new b64();

t.generate('sample string');

const auto_test_templators = [
  {
    // namespace/name
    name: 'base64',
  }
];

async function each_case(tname) {
  global.templatorsconf.reverberate = false;

  console.log('going for: ', tname);

  const t = trequire(tname).templator;
  const trequire_examples = trequire(tname).examples;

  const instance = new t();
  //const ex1_trequire_example_geenrator = trequire_examples(tname);
  let genr = trequire_examples();
  while (true) {
    // console.log('TODO: use generators'); //DONE!!
    /*
    const {example, expected} = ex1_trequire_example_geenrator.get_next_pair(); // make it more yeild-y. Or async.
    */
    const iter = genr.next();
    if (iter.done) {
      break;
    }
    console.log('generated:', iter.value)
    if (!('input' in iter.value) || !('output' in iter.value)) {
        throw new Error('generator must yield `{input,output}`');
    }
    // or: {example, expected}
    const {input, output} = iter.value;

    console.log(instance.generate(output));
    // feed(input)
    const actual_output = instance.resolve(input);
    console.log({actual_output, input});
    chai.expect(actual_output).eql(output);

    //use decorators:
    //feed_generator -> for lazy-serial (for real-time!)
      // also lazy input: real-time
    //feed_async
    //feed_async_mapseries
    //feeder_as_promise (useful for Promise.map_all)

    // reverse
    //feed-back reconstructed input !
    const reverse_input = instance.generate(output);
    chai.expect(reverse_input).eql(input);  // magic

    // idempotence
    // ?
  }
  // check documentations, etc
}

auto_test_templators.forEach( tname => each_case(tname.name) );

// todo: commandline for each templator. testt base64;testt b64url;
