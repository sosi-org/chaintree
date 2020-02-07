'use strict';
function test_all(require_) {

    function test_(data_utf8) {
      const e64 = require_.util.encode64(data_utf8);
      const orig_reconst = require_.util.decode64(e64);

      if (orig_reconst !== data_utf8) {
        throw new Error('test failed: ', orig_reconst, '!==', data_utf8);
      }
    }

    test_('ab12..');
    test_('چشم');
    test_('');
    // test_(13);
}
module.exports = test_all;
