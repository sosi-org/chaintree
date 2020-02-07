'use strict';

const util = require('util');
const path = require('path');

const TEMPLATORS_FOLDER = 'templator';


function exassert(cond, throw_lazy_string) {
    if (!cond) {
        throw new Error( throw_lazy_string() );
    }
}

function requiret(templator_name) {
    const command = `requiret('${templator_name}')`;
    exassert(!(/\.js$/.exec(templator_name)), () => 'dont use .js in ' + command);

    if (!util.isString(templator_name)) {
        throw new Error('Templator must be a string: ' + typeof(templator_name)  + ' ' + templator_name);
    }
    const fullpath_js = path.join(__dirname, TEMPLATORS_FOLDER, templator_name + '.js');
    const temp = require(fullpath_js);
    if (! ('templator' in temp)) {
        console.log('Templator module must export a variable naemd "templator" = main class.');
    }
    const templator = temp.templator;

    const fullpath_examplesjs = path.join(__dirname, TEMPLATORS_FOLDER, templator_name + '.examples.js');
    const examples = require(fullpath_examplesjs);
    if (examples) {
        //check if async function

        const isAsync = examples.constructor.name === "GeneratorFunction";
        exassert(isAsync, () => '.example must be an generator function*. Instead, it is: ' + examples.toString());
    }

    return {
        templator,
        examples,
    };
}


const fabrics = require('./fabrics-shared.js');

const error_checking = require('./error-checking.js');
module.exports = {requiret, fabrics, error_checking};
