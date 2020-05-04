'use strict';

// non-standard .spec.js file.

function exassert(cond, throw_lazy_string) {
  if (!cond) {
      throw new Error( throw_lazy_string() );
  }
}
function check_equal(a, b) {
  if (JSON.stringify(a.toJSON()) !== JSON.stringify(b.toJSON())) {
      throw new Error('Buffers not equal');
  }
}


function test_base64url_decode_to_binary__nopadded(_require) {
  const decode = _require.util.base64url_decode_to_binary;
  const encode = _require.util.base64url_encode_buffer_nopadded;

  const signature = 'YOWPewyGHKu4Y_0M_vtlEnNlqmFOclqp4Hy6hVHfFT4';
  const b_out = decode(signature);
  const expectated =
      new Buffer.from([0x60, 0xe5, 0x8f, 0x7b, 0x0c,  0x86, 0x1c, 0xab, 0xb8, 0x63, 0xfd, 0x0c, 0xfe, 0xfb, 0x65, 0x12, 0x73, 0x65, 0xaa, 0x61, 0x4e, 0x72, 0x5a, 0xa9, 0xe0, 0x7c, 0xba, 0x85, 0x51, 0xdf, 0x15, 0x3e ]);

  check_equal(b_out, expectated);

  const recode = encode(b_out);
  exassert(recode === signature, () => 'error1');
  const recode2 = encode(expectated);
  exassert(recode2 === signature, () => 'error2');

}

module.exports = (m) => {
  test_base64url_decode_to_binary__nopadded(m)
};
