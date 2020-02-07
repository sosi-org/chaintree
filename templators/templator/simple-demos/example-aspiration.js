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
    },
    {name: 'b64url',},
    {name: 'from_file', cargs: ['./README.md'] },
];

/*async*/ function each_case(tentry) {
  global.templatorsconf.reverberate = false;

  const tname = tentry.name;
  let constructor_args = tentry.cargs;

  if (!constructor_args) {
    constructor_args = [];
  }

  console.log('Testing templator:', tname);

  const t = trequire(tname).templator;
  const texample_generator = trequire(tname).examples;

  // todo:rename: tobj
  const instance = new t(...constructor_args);


  if (texample_generator !== null) {
      let genr = texample_generator();
      while (true) {
        const iter = genr.next();
        if (iter.done) {
          break;
        }
        if (!('input' in iter.value) || !('output' in iter.value)) {
            throw new Error('generator must yield `{input,output}`');
        }
        // or: {example, expected} =
        //const {input, output, constructor_args} = iter.value;
        const {input, output} = iter.value;

        // console.log(instance.generate(output));

        // feed(input)
        const actual_output = instance.resolve(input);
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
  } else {
    console.log('no examples');
  }
  // check documentations, etc
}

auto_test_templators.forEach( tentry => each_case(tentry) );

// todo: commandline for each templator. testt base64;testt b64url;
