'use strict';

function encode64(strData) {
  const buffer = Buffer.from(strData);
  return buffer.toString('base64');
}

function decode64(stringBase64) {
  // todso: make sure causes exception if not base64
  // test '==' is added
  const buffer = Buffer.from(stringBase64, 'base64');
  return buffer.toString('utf-8');
}

function decode64_to_binary_buffer(stringBase64) {
  const buffer = Buffer.from(stringBase64, 'base64');
  return buffer;
}



/*
    Matches strings of base64.
    As a result, `resolve()` decodes, and `generate()` encodes.
*/
class Base64 {
    resolve(string_base64) {
        this;
        return decode64(string_base64);
    }
    generate(input_utf8) {
      this;
      return encode64(input_utf8);
  }
}

const templator = Base64;

module.exports = {
  util: {
    encode64,
    decode64,
    decode64_to_binary_buffer,
  },
  Base64,
  templator,

  // io_specs: ['mime:application/json', 'mime:application/json;charset=utf-8'],
  io_specs: ['application/json', 'application/json;charset=utf-8'],
  // todo: move io_specs to register_templator
};
