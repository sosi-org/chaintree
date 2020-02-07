
'use strict';

//const chai = require('chai');

const {requiret, fabrics } = require(__dirname + '/../requiret.js');

function must_throw(callback) {
    var failed = true;
    try {

      callback();

    } catch(e) {
    failed = false;
    }
    if (failed) {
      throw new Error('failed to throw');
    }
}

must_throw( () =>{


  requiret('base64.js');


});

console.log('fine.');
