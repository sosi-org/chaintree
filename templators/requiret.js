'use strict';

const path = require('path');

const PREFIX = 'templator';

function requiret(templator_name) {
    const fullpath = path.join(__dirname, PREFIX, templator_name);
    console.log('require-templator:', fullpath);
    return require(fullpath);
}


const fabrics = require('./fabrics-shared.js');

module.exports = {requiret, fabrics};
