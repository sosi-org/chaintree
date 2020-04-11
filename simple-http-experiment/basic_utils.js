'use strict';

function unused() {}

/*
   basic_utils.js should not depend on assertions.js, console_art.js, etc.
*/


function check(cond, ...msga) {
    if(!cond && cond !== '') {
      throw new Error(msga.join(''));
    }
}


function is_dict(x) {
    if(typeof x !== 'object' ) {
      return false;
    }
    if(x === null) {
        return false;
    }

    //the only 'object' that does not have 'constructor' is null
    if(!x['constructor'] || !x.constructor) {
        return false;
    }

    return x.constructor.name === 'Object';
}

/* Due to incomplete implementation. Used only using dev mode (dev LC). */
function is_neglectedcontent(x) {
    if(typeof x !== 'object' ){
      return false;
    }
    if(!x || !x.constructor) {
      return false;
    }

    return x.constructor.name === 'NeglectedContent';
}
function is_blockedcontent(x) {
    if(typeof x !== 'object' ) {
      return false;
    }
    if(!x || !x.constructor) {
      return false;
    }
    return x.constructor.name === 'BlockedContent';
}

function is_targetedcontent(x) {
    if(typeof x !== 'object' ) {
      return false;
    }
    if(!x || !x.constructor) {
      return false;
    }

    return x.constructor.name === 'TargetedContent';
}


function is_undefined(c) {
    return c === undefined;
}

function key_in_dict(fieldname, dict) {
    check(is_dict(dict), 'Type must be dict');
    return fieldname in dict && dict.hasOwnProperty(fieldname);
}

function is_keyval1(kv) {

    if(!is_dict(kv)) {
      return false;
    }
    let counter = 0;
    for(let k in kv) {
      if(kv.hasOwnProperty(k)) {
        let c = kv[k];
        unused(c);
        ++counter;
      }
    }
    if (counter !== 1) {
        return false;
    }
    return true;
}


function is_simple_string(content) {
    if(Array.isArray(content)) {
      return false;
    }
    if(typeof content !== 'string') {
      return false;
    }
    return true;
}


function is_simple_int(content) {
    if(typeof content !== 'number') {
      return false;
    }
    if( Math.floor(content) !== content) {
      return false;
    }

    return true;
}

function keys_are_subset(a, b, check_callback) {

    for( let k in a) {
        if (!(k in b)) {
            return false;
        }
        let s1 = a[k];
        let s2 = b[k];
        if (check_callback === undefined) {
            if (s1 !== s2) {
                return false;
            }
        } else {
            if (!check_callback(s1, s2)) {
                return false;
            }
        }
    }
    return true;
}
/**
 * Compares if the contents of two dictionaries (or of a json-compatible type) are equal at all levels.
 * Used only for debugging purposes becuase it is a slow method.
 * Never use in poroduction. Use for test/dev only.
 * Will return false if receives undefined
*/
function identical_dicts(a, b, depth=1, allow_non_dicts=false) {

    if (a === undefined) {
      return false;
    }
    if (b === undefined) {
      return false;
    }
    if (!allow_non_dicts) {
       check(typeof a === 'object' && typeof b === 'object', 'non-dict not allowed');
    }
    if (typeof a !== typeof b) {
        if ((typeof a === 'string') && is_RegExp(b)) {
            let result = b.test(a);
            return result;
        }

        return false;
    }

    if (Array.isArray(a) !== Array.isArray(b)) {
      return false;
    }
    if (Array.isArray(a)) {
        for (var i in a) {
            if (!identical_dicts(a[i], b[i], depth-1, allow_non_dicts)) {
              return false;
            }
        }
        return true;
    }
    if (typeof a !== 'object') {
        return a === b;
    }
    let next_ab = (a,b)=>identical_dicts(a,b, depth-1, true);
    let next_ba = (a,b)=>identical_dicts(b,a, depth-1, true);
    let boolean_result =
        keys_are_subset(a, b, next_ab) &&
        keys_are_subset(b, a, next_ba);

    return boolean_result;
}

function identical_dicts__allow_non_dicts(a, b) {
    let depth = 1;
    let allow_non_dicts = true;
    return identical_dicts(a, b, depth, allow_non_dicts);
}

function process_json_obj_recursively(a, depth, branch_callback, array_callback, leaf_callback, path) {
    // based on 'identical_dicts'

    check(typeof branch_callback === 'function' || branch_callback === null);
    check(typeof array_callback === 'function' || array_callback === null);
    check(typeof leaf_callback === 'function' || leaf_callback === null);

    check(!is_undefined(a));

    if (Array.isArray(a)) {
        if (array_callback !== null) {
            const outcome = array_callback(a, depth, path);
            if (outcome === process_json_obj_recursively.SKIP_RECURSION_INTO_THIS) {
                return;
            }
            /*
            if (outcome === process_json_obj_recursively.OMITTED_FIELD) {
                ...;
            }
            */
        }
        for (let i=0; i < a.length; ++i) {

            let path2 = undefined;
            if(path) {
                path2 = [...path, i];
            }

            process_json_obj_recursively(a[i],depth+1,   branch_callback, array_callback, leaf_callback, path2);
        }
        return;
    }

    if (!is_dict(a)) {
        if (leaf_callback !== null) {
            // May change the contents and structure
            const outcome = leaf_callback(a, depth, path);
            unused(outcome);
        }
        return;
    }

    check(is_dict(a));
    if (branch_callback !== null) {
        // May change the contents and structure
        const outcome = branch_callback(a, depth, path);
        if (outcome === process_json_obj_recursively.SKIP_RECURSION_INTO_THIS) {
            return;
        }
        /*
        if (outcome === process_json_obj_recursively.OMITTED_FIELD) {
            ...;
        }
        */
    }
    for( let k in a) {
      if (a.hasOwnProperty(k)) {
        let bval = a[k];

        let path2 = undefined;
        if(path) {
            path2 = [...path, k];
        }

        process_json_obj_recursively(bval,depth+1,   branch_callback, array_callback, leaf_callback, path2);
      }
    }
}
/**
   The callbacks used in `process_json_obj_recursively` may change the contents and structure.
   If changing the structure affects the flow of this traversal (`process_json_obj_recursively`), we want to skip the rest of the traversal process.
   Skipping means terminating the iteration over the indices of array, or the keys of dictionary.
   This means don't continue the recursion process. In fact it means discontinue the iterations on one branch (equivalent to 'break').
   In other words, we are modifying the branches (cutting or adding) of the parent,
   i.e. a node "above" the current node being procesed. The current = the element for which this flag is raised.
   In such cases, another whole pass of tree-traversal will be necessasry.
*/
process_json_obj_recursively.SKIP_RECURSION_INTO_THIS = 'SKIP-RECURSION-INTO-THIS';
// process_json_obj_recursively.OMITTED_FIELD = 'OMITTED-FIELD';


var SchemaChecker = {
    is_a: {
        keyval1:     x => is_keyval1(x),
        dict:        x => is_dict(x),   //generic_dict:
        string:      x => is_simple_string(x),
        neglectedcontent:  x=>is_neglectedcontent(x),
        blockedcontent:    x=>is_blockedcontent(x),
        targetedcontent:   x=> is_targetedcontent(x),
        array:   x=> Array.isArray(x),
        integer:   x=> (is_simple_int(x)),
        boolean:   x=> (typeof x === 'boolean'),
        number:   x=> (typeof x === 'number'),
        jsonable_shallow_valid: (x) => {
            let r = SchemaChecker.is_a.dict(x);
            r = r || SchemaChecker.is_a.string(x);
            r = r || SchemaChecker.is_a.array(x);
            r = r || SchemaChecker.is_a.boolean(x);
            r = r || SchemaChecker.is_a.number(x);
            return r;
        },
    },
    type: {},

    composite(type_signature) {
        check(SchemaChecker.is_a.string(type_signature));
        let t = null;
        if(type_signature in SchemaChecker.is_a) {
            t = SchemaChecker.is_a[type_signature];
        } else if(type_signature === '[string]') {  // array[string]
            t = ((value) => SchemaChecker.is_a.array(value) && (value.length === 0 || SchemaChecker.is_a.string(value[0]) ));
        } else {
            //?
            check(null);
        }
        check(t);
        t.istype = true;
        return t;
    },
};

function init_SchemaChecker(SchemaChecker) {
    // populating SchemaChecker.type
    for(let type in SchemaChecker.is_a) {
      if (SchemaChecker.is_a.hasOwnProperty(type)) {
        SchemaChecker.type[type] = SchemaChecker.is_a[type];
      }
    }
    for(let typename in SchemaChecker.is_a) {
      if (SchemaChecker.is_a.hasOwnProperty(typename)) {
        SchemaChecker.is_a[typename].istype = true;
      }
    }
}
init_SchemaChecker(SchemaChecker);

function is_RegExp(x) {
    //We could also use util.isRegExp() instead
    return x && (typeof x === 'object') && (x.constructor.name === 'RegExp');
}


function clone_dict__slow(d) {
    // recopy()
    var clone = JSON.parse(JSON.stringify(d));
    return clone;
}




function lookupPathInJson(jsonobjtree, path_array) {
    check(SchemaChecker.is_a.array(path_array));
    let head = jsonobjtree;
    check(head);
    for(let i in path_array) {
      if (path_array.hasOwnProperty(i)) {
        let key = path_array[i];
        check((typeof key) !== 'undefined');
        if (SchemaChecker.is_a.array(head)) {
        }
        let next = head[key];
        // console.log('          ---- next:'+(i+'/'+(path_array.length)), typeof next, '  isin?', key in head, path_array.join('/'));
        if (typeof next === 'undefined') {
            // todo: throw

            if (i+'' !== (path_array.length-1)+'' ) {
                console.log('Warning: Incomplete path lookup in json/obj @' + i, path_array);
            } else {
                // Fine, but undefined
            }
            return null;
        }
        check(typeof next !== 'undefined',
            'Field does not exist', key);
            //()=>/*NOSONAR*/'Field does not exist: \"'+key+'\". Path so far: ['+path_array.slice(0,i+1)+']. Checked in: '
            //  + (head)+'   keys: '+Object.keys(head)  );
        head = next;
      }
    }
    return head;
}


function isemptydict(dict) {
    // create two functions and validate_data_static is_dict in one.
    for(let k in dict) {
      if (dict.hasOwnProperty(k)) {
        // abosolutely no other way to avoid silly Sonar errors
        unused(k);
        return false;
      }
    }
    return true;
}

function isempty_array(a) {
    check(SchemaChecker.is_a.array(a));
    for(let k in a) {
        if (typeof k !== 'undefined') {
            return false;
        }
    }
    return true;
}


function typeinfo(c) {
    const types_f = SchemaChecker.is_a;
    let types = [];
    for(let k in types_f) {
      if (types_f.hasOwnProperty(k)) {
        const f = types_f[k];
        if (f(c)) {
            types.push(k);
        }
      }
    }
    if (c === null) {
        types.push(null);
    }
    if (c === undefined) {
        types.push(null);
    }
    if (c && c['constructor']) {
        types.push('class('+c['constructor']['name']+')');
    }
    return types.join(', ');
}



// Stack utilities

/**
 * Handy for debugging purposes
 */
function fullstack_colourful_printable_string(flatten) {
    const colors = require('./nocolors')(false);

    const s = split_stack_string(new Error().stack);

    const output = [];
    s.forEach( function ({funcname, source_file, pos: [posy, posx]}) {
        output.push(
            colors.cyan(funcname || 'anonymous')+colors.grey(' in '+source_file+':'+posy)
        );

        unused(posx);
    });
    if (flatten) {
      return output.join('\n');
    }
    return output;
}



/**
 * Returns The call point in source code, to be able to debug DSL code lines (transforms).
 * This is used inside _DECORATE_() where it binds this infomration about the transform.
 * @param  {Number} [wherei=4] how many stack frames to climb up to get the information about
 * the usage of this transform for which _DECORATE_ is called. The location within stack
 * when used inside _DECORATE_ is usually wherei=4.
 * @return { {funcname, source_file, pos: [posy, posx]}  }
 * Usage example: `const caller_info = report_relevant_stack_entry_at(new Error().stack, 2);`
 */

function report_relevant_stack_entry_at(stack, wherei=4) {
    check(arguments.length === 2);
    return split_stack_string(stack)[wherei];
}


/*
 * A rigorous and tested utility for reflections and debugging and refactoring.
 * Usage: `split_stack_string(new Error().stack)`
 */
function split_stack_string(stack_str) {

  function per_item(stackline) {
      const regexp = /^ {4}at ([\w \.$<>\[\]]*) \(([^\n]*):(\d+):(\d+)\)[^\n]*$/mg;
      const result = regexp.exec(stackline);
      if (result !== null) {
          check(result.length === 5, '5');
          let [fullmatch, funcname, source_file, posy, posx] = result;
          unused(fullmatch);

          return {funcname, source_file, pos: [posx, posy]};
      } else {
          const regexp2 = /^ {4}at ([^\n]*):(\d+):(\d+)[^\n]*$/mg;
          const result = regexp2.exec(stackline);
          if (result !== null) {
              check(result.length === 4, '4');
              const [fullmatch, source_file, posy, posx] = result;
              const funcname = 'anon';
              unused(fullmatch);

              return {funcname, source_file, pos: [posx, posy]};
          } else {
              const regexp3 = /^ {4}at ([^\n]*)[^\n]* \(<anonymous>\)$/mg;
              const result = regexp3.exec(stackline);
              if (result !== null) {
                  check(result.length === 2, '2');
                  const [fullmatch, funcname] = result;
                  const source_file = '';
                  const posx = '-1', posy = '-1';
                  unused(fullmatch);
                  return {funcname, source_file, pos: [posx, posy]};
              } else {
                  throw new Error('stack match failed will all three RegExps.');
              }
          }
      }

  }
  let stack_items = [];
  if (!(typeof stack_str === 'string')) {
      throw Error('stack_str is not a string: '+ (typeof stack_str)+'  ='+stack_str);
  }
  check(typeof stack_str === 'string');
  const stack_str_lines = stack_str.split('\n').slice(1);

  for(let stackline of stack_str_lines) {

    const sli = per_item(stackline);
    stack_items.push( sli );

  }

  check(typeof stack_str === 'string');

  check(typeof stack_str === 'string');
  check(stack_items.length === stack_str.split('\n').length-1);

  return stack_items;
}

function if_lazy(c) {
    if (typeof c === 'function') {
      return c();
    }
    return c;
}


/*
    fixes node's bugs such as considering "" as false.
*/
function asBool(x) {
  if ((typeof x) === 'string' && x.length === 0) {
    return true;
  }
  return !!x;
}

/*
    usage:
    callback(key, value)
*/
function forEachField(c, callback) {
    for(let field in c) {
        if (c.hasOwnProperty(field)) {
            callback(field, c[field]);
        }
    }
}

/*
    callback(key, value), during which `key` does not belong to c anymore.
*/
function forEachFieldMove(c, callback) {
    for(let field in c) {
        if (c.hasOwnProperty(field)) {
            const value = c[field];
            delete c[field];
            callback(field, value);
        }
    }
}

module.exports = {
    is_dict,
    is_neglectedcontent,
    is_blockedcontent,
    key_in_dict,
    is_targetedcontent,
    is_keyval1,
    SchemaChecker,
    is_simple_string,
    is_undefined,
    is_RegExp,

    isemptydict,
    isempty_array,

    identical_dicts,
    identical_dicts__allow_non_dicts,
    process_json_obj_recursively,

    clone_dict__slow,
    lookupPathInJson,
    is_simple_int,

    typeinfo,

    split_stack_string,
    fullstack_colourful_printable_string,
    report_relevant_stack_entry_at,

    if_lazy,
    asBool,

    forEachField,
    forEachFieldMove,
};
