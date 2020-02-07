'use strict';

const util = require('util');
const path = require('path');

const TEMPLATORS_FOLDER = 'templator';

function requiret(templator_name) {
    const command = `requiret('${templator_name}')`;
    if (/\.js$/.exec(templator_name)) {
        throw new Error('dont use .js in ' + command);
    }
    if (!util.isString(templator_name)) {
        throw new Error('Templator must be a string: ' + typeof(templator_name)  + ' ' + templator_name);
    }
    const fullpath = path.join(__dirname, TEMPLATORS_FOLDER, templator_name + '.js');
    return require(fullpath);
}


const fabrics = require('./fabrics-shared.js');

const error_checking = require('./error-checking.js');
module.exports = {requiret, fabrics, error_checking};
