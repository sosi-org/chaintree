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


  // TODO: must reject this (onconsistent redundancy)
  /*
    "rejects:", "fails:", "throws:", "breaks:".
    Exception class:
      ReversiblityError(tclass, [input_arags], direction:[ direciton-of-application(FORWARD | BACKWARD), error locus(STRAIGHT|REVERB)], )
      ReversiblityFailedError,
      ConsistencyError(redundancy cancellation/resolution)
  */
  yield {
    input: {"profile":{"name":"john2"},"birthday":{"year":1980},"data":{"name2":"john"}},
    output: {name: "john", year: 1980},
    tparams: [`{"profile":{"name": \${name} },"birthday":{"year":\${year}},"data":{"name2":\${name} }}`],
    breaks: [true, false], /* forward, backwards */
  };

}

module.exports = example_generator;

