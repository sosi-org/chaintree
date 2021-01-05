'use strict';
/*
Todo: keep a file with the same name here, but move this to ../tests/test-reversibility.js
*/
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

const {requiret} = require('../requiret');
const trequire = requiret;


/*
TODO: usage:
const b64 = trequire('base64');
const t = b64();
*/
const b64 = trequire('base64').templator;
const t = new b64();

t.generate('sample string');


/*
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
*/


// todo: commandline for each templator. testt base64;testt b64url;
