'use strict';

const {requiret, fabrics} = require(__dirname + '/../requiret.js');
// add: from_file_async (full content), from_file_generator
// rename: from_file_sync
class from_file {
  constructor(filename) {
      const fs = require('fs');
      this.file_content_binarybuffer = fs.readFileSync(filename);
  }
  resolve(buffer) {
      "Meeting ends";
      fabrics.valid_value_as_template_constraint(buffer, this.file_content_binarybuffer, 'binary contents must be equal');
      return null;
  }
  generate(nullval) {
      fabrics.valid_value_as_template_constraint(nullval, null);
      return this.file_content_binarybuffer;
  }
}
/*
  Not good.
  todo: clamp (with given frequency. Or watcher.)
  In what case propagate? (i.e. like RxJS, but two-way: like PP, going through all the downstream. )

  Another (more important) alternative:
  Where the content of the file is provided (by use):
    the circle (circuit) of the file content.
    The file content is just a node in the middle (a "chash"-like mechanism/flow)
*/

module.exports = {
  from_file,
  templator: from_file
};
