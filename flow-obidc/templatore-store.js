'use strict';

const {check_error, allow_type, allow_fixed_special_only, allow_enum, add_slow_CustomError, lazy_assert_check_equal} = require('./error-checking.js');

add_slow_CustomError('base-type-name-already-registered');

class base_types {
    constructor() {
        this.store = {};
    }

    static type_signature(name) {
        return '@('+name+')';
    }

    lookup(name) {
        return this.store[base_types.type_signature(name)];
    }
    register(name) {
        allow_fixed_special_only( this.lookup(name), undefined, 'base-type-name-already-registered');
        this.store[base_types.type_signature(name)] = name;
    }
}

// globals. quasi-(Compile time).
/*
ct.the_basetypes_store = new base_types();
ct.the_templator_store = {};
*/

// type lookup table
// var the_basetypes_store = {};
var the_basetypes_store = new base_types();

// tuple lookup table
var the_templator_store = {};   // [];



function tuple_signature(input_signature_array) {
    return input_signature_array.map( type_name => base_types.type_signature(type_name) ).join(',');
}

// formal_signature()
function register_templator(class_ref, input_signature, output_signature) {
    input_signature.forEach( (type_name) => {
        if (!the_basetypes_store.lookup(type_name)) {
            the_basetypes_store.register(type_name);
        }
    });

    // const entry = {in: tuple_signature(input_signature), out: tuple_signature(output_signature), cls: class_ref};
    const entry_key = tuple_signature(input_signature) + 'x' + tuple_signature(output_signature);
    const entry = {inp: input_signature, outp: output_signature, cls: class_ref};
    the_templator_store[entry_key] = entry;
}

function lookup_templator(input_signature, output_signature) {
    input_signature.forEach( (type_name) => {
      if (!the_basetypes_store.lookup(type_name)) {
          throw new Error('basic type not not registered: ');
      }
    });
    const entry_key = tuple_signature(input_signature) + 'x' + tuple_signature(output_signature);
    const {inp, outp, cls} = the_templator_store[entry_key];
    return {inp, outp, cls};
}


// ct: quasi-compile-time
// rt: run-time: all instances and how they are connected.

module.exports = {
    register_templator,
    lookup_templator,
};
