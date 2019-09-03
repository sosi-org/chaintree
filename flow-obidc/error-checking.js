const {SchemaChecker, typeinfo} = require('../simple-http-experiment/basic_utils.js');


/* each of these is a constraint */
const CustomErrors = {
    'bad_type_name': {},
    'array_of_enum_strings': {},
    'code_alreay_registered': {},
};


function check_error(ok_cond, error_code, ...args) {
    const c = CustomErrors[error_code];
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
function lazy_assert_check_equal(a,b) {
    lazy_assert_check (a === b, 'must be equal. but are: '+a+' !=== '+b);
}

/*
    slow, and way before (preferred to be compile)

    registeres the error, runtime.

    executed at time of defintiion of funtions. (i.e. global scope direct "function call")
*/
function add_slow_CustomError(code) {

    allow_type(code, 'string');

    check_error(!CustomErrors[code], 'code_alreay_registered');

    CustomErrors[code] = {};
}


function allow_type(x, type) {
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
function allow_fixed_special_only(x, special) {
    if (x === special) {
        return;
    }
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

module.exports = {

    allow_enum,
    allow_type,
    add_slow_CustomError,
    check_error,
    lazy_assert_check_equal,
    allow_fixed_special_only,
};
