'use strict';


function* example_generator() {
  /*
  yield {output:'a string', input:'"a string"', tparams: []};
  yield {output: '', input: '""'};
  yield {output: 'یونیکد', input: '"یونیکد"'};
  */

 yield {input: `[abc, {a: cc}]` , output: '["abc",{"a":"cc"}]'};

   yield {input:
`- abc
-
    a: cc
`,
output:
`[
    "abc",
    {
        "a": "cc"
    }
]`,
tparams: [4]};
/*
  Why fails if done AFTER above one: because skips creating the  object (Constructir not called!)

  yield {input: `[abc, {a: cc}]` , output: '["abc",{"a":"cc"}]'};

*/

yield {input: `[abc, {a: cc}]` , output: '["abc",{"a":"cc"}]', tparams: []};

/*`
---
- abc
- a: cc
`,*/

}

module.exports = example_generator;

