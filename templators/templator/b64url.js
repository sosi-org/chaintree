'use strict';

/*
    "b64url"

    is the format used in the JWS's signature part.
    It is slightly different to base64 encoding/decoding.

    names: signature64  a.k.a. base64url  aka  b64url
*/

const {util} = require('./base64.js');

// See https://github.com/brianloveswords/node-jws/blob/6f89ebcff5c3b92cc9634abf1f306d3011c02fe5/lib/sign-stream.js#L54

/*
  todo: specify them templators using "from" and "to" formats.
  Is it unique given those two?
*/

/* string -> string */
function base64url_encode_strstr(str_base64) {
    return str_base64
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64url_encode_buffer_nopadded(buffer) {
    return base64url_encode_strstr(
          buffer
          .toString('base64')
      );
      /*
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
      */
}
function base64url_encode_buffer_padded(buffer) {
    const s = base64url_encode_strstr(
          buffer
          .toString('base64')
      );
      return pad4(s, 4, '=');
}


function pad4(str_b64url, modulo, pad_char) {
    const len = str_b64url.length;
    // (desired)       0,3,2,1

    // (len % 4)       0,1,2,3
    // ((len+1) % 4)   1,2,3,0
    // ((len-1) % 4)   -1,0,1,2
    // -((len-1) % 4)  1,0,-1,-2
    // -((len-1) % 4)  1,0,-1,-2

    // (len % 4)           0,1,2,3
    // (len % 4)-1         -1,0,1,2
    // (len % 4)-1+4       3,4,5,6
    // ((len % 4)-1+4)%4   3,0,1,2
    // 4-((len % 4)-1)-1   4, 3, 2, 1
    // 4-(len % 4)         4, 3, 2, 1
    // (4-(len % 4))%4     0, 3, 2, 1

    const pads = (modulo-(len % modulo)) % modulo;
    const padded = str_b64url + (pad_char.repeat(pads));

    if (padded.length % modulo !== 0) {
      throw new Error('bad padding');
    }

    return padded;
}
// old name: base64url_decode
function base64url_decode_to_binary(str_b64url) {
    // util.decode64(str_b64url);  //throw if error.
    const padded = pad4(str_b64url, 4, '=');
    const q =
        padded
        .replace(/\-/g, '+')
        .replace(/\_/g, '/');

    if (q.length % 4 !== 0) {
      throw new Error('bad padding');
    }

    return util.decode64_to_binary_buffer(q);
}



class b64url_buffer {
    constructor(padded=true) {
        this.padded = padded;
    }
    resolve(str) {
        //console.debug('b64url_buffer: base64url_decode_to_binary:', str);
        return base64url_decode_to_binary(str);
    }
    generate(buffer) {
        //console.debug('b64url_buffer.generate: binary_to_base64url: ', buffer);
        let binary_to_base64url;
        if (this.padded ) {
            binary_to_base64url = base64url_encode_buffer_padded;
        } else {
            binary_to_base64url = base64url_encode_buffer_nopadded;
        }
        var e = binary_to_base64url(buffer);
        //console.debug('b64url_buffer.generate.return:', buffer);
        return e;
    }
}

require('../templatore-store.js').register_templator(
    b64url_buffer, ['b64url'], ['buffer']
);

module.exports = {
  util: {
      base64url_encode_strstr,

      //todo: rename:
      base64url_decode_to_binary,
      //todo: rename:
      base64url_encode_buffer_padded,
      base64url_encode_buffer_nopadded,
  },
  // b64url,
  b64url_buffer,
  templator: b64url_buffer,
};
