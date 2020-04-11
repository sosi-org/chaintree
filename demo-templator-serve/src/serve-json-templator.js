'use strict';

module.exports = function transform(input_jso) {
    console.debug('input received', input_jso);
    return {'ok': 'ok2', ...input_jso};
}
