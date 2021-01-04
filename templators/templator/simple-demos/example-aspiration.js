'use strict';

const util = require('util');
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


function exassert(cond, throw_lazy_string) {
  if (!cond) {
      throw new Error( throw_lazy_string() );
  }
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
    /* temporarilyu disable*/
    {name: 'b64url',},
    {name: 'from_file' },
    {name: 'yaml-json' },
    {name: 'json-sub' },
];

/*async*/ function each_case(tentry) {
  global.templatorsconf.reverberate = false;

  const tname = tentry.name;

  console.log('Testing templator:', tname);

  const t = trequire(tname).templator;
  const texample_generator = trequire(tname).examples;


  var tobj = null;

  const no_examples = texample_generator === null;

  if (no_examples) {
    console.log('new');
    const tobj = new t(...[]);
    console.log('WARNING: no examples for ' + tname );
  }

  if (!no_examples) {
      var tobj = null;
      let genr = texample_generator();
      while (true) {

        const iter = genr.next();
        if (iter.done) {
          break;
        }
        if (!('input' in iter.value) || !('output' in iter.value)) {
            throw new Error( tname + '.examples.js generator must yield `{input,output}`');
        }
        // or: {example, expected} =
        //const {input, output, constructor_args} = iter.value;
        const {input, output, params} = iter.value;


        if (params) {
            exassert(util.isArray(params), ()=>'param: Must be an array (as constructor arguments) or falsey.');
            console.log('new');
            tobj = new t(...params);
        } else {
            // reusing the first instance? no.
            // tobj = tobj0;
            console.log('constructor call skipped. keeping previous tobj for ' + tname);
            if (tobj === null ) {
              console.log('new: default constructor for first item');
              tobj = new t(...[]);
            }
        }
        exassert(tobj !== null, ()=>'error');

        // console.log(tobj.generate(output));

        // feed(input)
        const actual_output = tobj.resolve(input);
        chai.expect(actual_output).eql(output);

        //use decorators:
          //feed_generator -> for lazy-serial (for real-time!)
            // also lazy input: real-time
        //feed_async
        //feed_async_mapseries
        //feeder_as_promise (useful for Promise.map_all)

        // reverse
        //feed-back reconstructed input !
        const reverse_input = tobj.generate(output);
        chai.expect(reverse_input).eql(input);  // magic

        // idempotence
        // ?
      }
  }
  // check documentations, etc
}

auto_test_templators.forEach( tentry => each_case(tentry) );

// todo: commandline for each templator. testt base64;testt b64url;
