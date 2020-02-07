'use strict';

// non-standard .spec.js file.

function test_base64url_decode_to_binary(_module) {
  const signature = 'YOWPewyGHKu4Y_0M_vtlEnNlqmFOclqp4Hy6hVHfFT4';
  console.log(_module.util.base64url_decode_to_binary(signature));
  // console.log(util.decode64(base64url_decode(signature)));

  // process.exit(0);
}


console.log('test done');

module.exports = (m) => {
  test_base64url_decode_to_binary(m)
};
