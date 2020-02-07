'use strict';
/*
    `require_pem()` constructor inputs a filename as a ref-filename.
    It only allows PEM files (whatever they are in relation to other key-like files.)

    Like `from_file`, the file contents have their oun closed circuit.
    Use `from_file` instead for now.
*/

// older notes:
// ssa source (input) required (from the upper circuits/circle)
// const ssa = '??';
// attach(file, 'pem-file-decoder')
// const require_pem = (filename) => {}


class require_pem {
    // dilema. How can this be non-cloning, non-deleting? (reveraible)
    constructor(filename) {
        const fs = require('fs');
        const file_content_buffer = fs.readFileSync(filename);
        // console.log('file_content_buffer', file_content_buffer);
        this.pem_format = require('pem-file');
        this.file_content_binarybuffer = file_content_buffer;
    }
    /*
    resolve(nullval) { // file_content_binarybuffer
        const buffer = pem.decode(this.file_content_binarybuffer);
        return buffer;
    }
    generate(buffer) {
        const file_content_binarybuffer = pem.encode(buffer, 'DATA');
        return file_content_binarybuffer;
    }

    priv_key_source.resolve(); // this is more about generate()

    */
    resolve(buffer) {
        const file_content_binarybuffer = this.pem_format.encode(buffer, 'DATA');

        // lazy_assert_check_equal(file_content_binarybuffer, this.file_content_binarybuffer);
        // expand inline:, remove valid_value_as_template_constraint() ?
        fabrics.valid_value_as_template_constraint(file_content_binarybuffer, this.file_content_binarybuffer, 'binary contents must be equal');

        return null;
    }
    generate(nullval) {
        fabrics.valid_value_as_template_constraint(nullval, null);
        //try {
            const buffer = this.pem_format.decode(this.file_content_binarybuffer);
            return buffer;
        //} catch (e) {
        //    console.log('caught');
        //    throw new Error('constraint error: PEM file has problems: ' +e);
        //}
        // work around
        //return this.file_content_binarybuffer;
    }
}
// const pem = require_pem('./sensitive-data/r1_private_key.key');
// const priv_key_source = new require_pem('./sensitive-data/r1_private_key.key');

module.exports = {
  from_file
};
