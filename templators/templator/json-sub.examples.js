'use strict';


function* example_generator() {

  yield {
    input: {"profile":{"name":"john"},"birthday":{"year":1980},"data":{"jack":"surename"}},
    output: {name: "john", year: 1980},
    /* constructor args */
    tparams: [`{"profile":{"name": \${name} },"birthday":{"year":\${year}},"data":{"jack":"surename"}}`],
  };

  // lookup the key
  yield {
    input: {"profile":{"name":"john"},"birthday":{"year":1980},"data":{"jack":"surename"}},
    output: {name: "john", year: 1980, misc: "jack"},

    tparams: [`{"profile":{"name": \${name}} },"birthday":{"year":\${year}},"data":{${misc}:"surename"}}`],
  };

  // redundancy
  yield {
    input: {"profile":{"name":"john"},"birthday":{"year":1980},"data":{"name2":"john"}},
    output: {name: "john", year: 1980},
    tparams: [`{"profile":{"name": \${name} },"birthday":{"year":\${year}},"data":{"name2":\${name} }}`],
  };


  // must reject this (onconsistent redundancy)
  yield {
    input: {"profile":{"name":"john2"},"birthday":{"year":1980},"data":{"name2":"john"}},
    output: {name: "john", year: 1980},
    tparams: [`{"profile":{"name": \${name} },"birthday":{"year":\${year}},"data":{"name2":\${name} }}`],
  };

}

module.exports = example_generator;

