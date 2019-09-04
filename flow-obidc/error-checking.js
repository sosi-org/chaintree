const {SchemaChecker, typeinfo} = require('../simple-http-experiment/basic_utils.js');

const {TemplatorConstraintError, FlowValueConstraintError} = require('./custom-errors/custom-exceptions.js');

/* each of these is a constraint */
// old name: CustomErrors
const ErrorCategories = {
    'bad_type_name': {},
    'array_of_enum_strings': {},
    'code_alreay_registered': {},
};


function check_error(ok_cond, error_code, ...args) {
    const c = ErrorCategories[error_code];
    if (!c) {
        throw new TypeError('bad error code: '+error_code);
    }
    if (ok_cond) {
        return;
    } else {
        const message = [error_code, ...args].join(' | ');
        console.log('message', message);
        throw new Error(message);
    }
}

function lazy_assert_check(ok, message) {
   if (!ok) {
      console.error(message);
      throw new Error(message);
   }
}
function is_buffer(a) {
    return a && a.constructor && /*a.constructor.name == 'Buffer' &&*/ a.constructor === Buffer;
}
function equal_and_buffer(a, b) {
    if (is_buffer(a)) {
        if (is_buffer(b)) {
            if (a.equals(b)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    return true;
}
function lazy_assert_check_equal(a,b, error_class=Error, error_code) {
    if (is_buffer(a) || is_buffer(b)) {
        if (!equal_and_buffer(a, b)) {
            throw new error_class('incompatible types: should be: Buffer vs Buffer. Are:', a,b);
        }
    }
    // add error_code
    lazy_assert_check (a === b, error_code + '. Must have been equal. but are: '+a+' !=== '+b);
}

/*
    slow, and way before (preferred to be compile)

    registeres the error, runtime.

    executed at time of defintiion of funtions. (i.e. global scope direct "function call")
*/
function add_slow_ErrorCategory(code) {

    allow_type(code, 'string');

    check_error(!ErrorCategories[code], 'code_alreay_registered');

    ErrorCategories[code] = {};
}


function allow_type(x, type, context) {
    // context: flow value type (run-time), etc.
    let ok = SchemaChecker.is_a.string(type);
    ok = ok && (x !== null) && (x !== undefined);

    if (x === null || x === undefined) {
        throw new TypeError(x + ' is undefined or null');
    }
    let fine = SchemaChecker.composite(type);

    if (ok && fine(x) /*|| (typeof x) === type */ ) {
        return;
    } else {
        throw new TypeError(x + ' must be of type '+type);
    }
}
//
function allow_fixed_special_only(x, special, error_code) {
    // combine with lazy_assert_check_equal()
    if (x === special) {
        return;
    }
    check_error(false, error_code);
    throw new TypeError(x + ' must be === '+special);
}

function allow_enum(x, enum_array) {
    // allow_type(x, type)
    check_error(SchemaChecker.is_a.array(enum_array), 'array_of_enum_strings');
    if (enum_array.includes(x)) {
        return;
    } else {
        throw new TypeError(x);
    }
}
/*
    Exceptions to create:
        // Status other than 200
    Template Constraint violated:  (runtime)

Other:
    Flow wiring problem:  // wiring-time
    Flow content/value problem: // run-time
            Flow constraint

*/

module.exports = {

    allow_enum,
    allow_type,
    add_slow_ErrorCategory,
    check_error,
    lazy_assert_check_equal,
    allow_fixed_special_only,
};
