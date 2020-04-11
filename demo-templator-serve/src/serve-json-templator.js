'use strict';

module.exports = function transform(input_jso) {
    return {'ok': 'ok2', ...input_jso};
}
