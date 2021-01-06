'use strict';

const util = require('util');
const chai = require('chai');

/*
Terms:
* tobj: A Templator. An object, instance of a Templator class.
* exampleset: for one single Templator class
* examine: to test reversibility.
* Templator class:
*/

// untested psudo-code
/*
TODO:
const trequire = require('templator-require');

OR: (not good)
const templator = require('templator-require');
const b64 = teamplator('base64');

*/

const {requiret} = require('../requiret');
const trequire = requiret;

global.templatorsconf =  {
  reverberate: false,
}


function exassert(cond, throw_lazy_string) {
  if (!cond) {
      throw new Error( throw_lazy_string() );
  }
}

/* list of Templators to be tested for reversibility. */
const auto_test_templators = [
    {
      // namespace/name
      name: 'base64',
    },
    /* temporarilyu disable*/
    {name: 'b64url',},
    {name: 'from_file' },
    {name: 'yaml-json' },
    // {name: 'json-sub' },
];

function* loopthrough(genr) {
  while (true) {

    const iter = genr.next();
    if (iter.done) {
      break;
    }

    yield iter.value;
  }
}

/**
 * The logic of obtaining each tobj for each case in an exampleset.
 * Calls constructor `t` (for Templator) using args `tparams` if necessary.
 * Returns the new "tobj" (a Templator object).
 * This is the logic used for tests: creates the object only when necessary.
 * `last_tobj`: last test case's "tobj".
 * `{tobj}` means the returned output.
 */
const ISOLATE1/*{tobj}*/ = (t, tparams, tname, last_tobj) =>
{

    if (tparams) {
      exassert(Array.isArray(tparams), ()=>'param: Must be an array (as constructor arguments) or falsey.');
      console.log('new');
      const tobj_new = new t(...tparams);
      return tobj_new;

    } else {
      // reusing the first instance? no.
      // tobj = tobj0;
      console.log('constructor call skipped. keeping previous tobj for ' + tname);
      if (last_tobj === null ) {
        console.log('new: default constructor for first item');
        const tobj_new = new t(...[]);
        return tobj_new;

      }
    }

    return last_tobj;
};

function IF_OR(x, y) {
  return (x !== undefined)? x : y;
}

function test_one_case(tobj, input, output) {
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

/** Runs all testcases for a geiven TEmplator class, base on its `.examples`. */
/*async*/ function examine_exampleset(tentry) {
  global.templatorsconf.reverberate = false;

  const tname = tentry.name;

  console.log('Testing templator:', tname);

  /* constructor for this case's Templator class */
  const t = trequire(tname).templator;
  const texample_generator = trequire(tname).examples;

  const no_examples = texample_generator === null;

  if (no_examples) {
    console.log('new');
    const tobj = new t(...[]);
    console.log('WARNING: no examples for ' + tname );
  }

  if (!no_examples) {
      let lastcase_tobj = null;
      let genr = texample_generator();
      for (const example_entry_case of loopthrough(genr)) {
        if (!('input' in example_entry_case) || !('output' in example_entry_case)) {
            throw new Error( tname + '.examples.js generator must yield `{input,output}`');
        }
        /*
          The Templator constructor arguments
            aka. Templator parameters
            aka. tparams cparams params constructor_args
        */
        // or: {example, expected} =
        //const {input, output, constructor_args} = example_entry_case;
        const {input, output, tparams} = example_entry_case;

        const tobj = ISOLATE1(t, tparams, tname, lastcase_tobj);

        exassert(tobj !== null, ()=>'error');

        test_one_case(tobj, input, output);

        lastcase_tobj = tobj;
      }
  }
  // check documentations, etc
}

auto_test_templators.forEach( tentry => examine_exampleset(tentry) );

// todo: commandline for each templator. testt base64;testt b64url;
