'use strict';

/*
const fetch = require('node-fetch');
*/
/*
async function _request(url, ...args) {
  try {
    const response = await fetch(url, ...args);
    return response;
  } catch (e) {
    throw e;
  }
}
*/
const https = require('https')


function lazy_assert_check(ok, message) {
   if (!ok) {
      console.error(message);
      throw new Error(message);
   }
}
function lazy_assert_check_equal(a,b) {
    lazy_assert_check (a === b, 'must be equal. but are: '+a+' !=== '+b);
}

const CustomErrors = {
    bad_type_name: {},
    array_of_enum_strings: {},
    // each of these is a constraint
    'argsmap-should-not-have-0': {},
    'resolver-regexp-pattern-did-not-match': {},
};
/*
function CustomError(errorCode, ...args) {
    // assert errorCode in CustomErrors;
    return Exception(errorCode);
}
*/

const {SchemaChecker, typeinfo} = require('./basic_utils.js');
//SchemaChecker.composite.

function allow_type(x, type) {
    let ok = SchemaChecker.is_a.string(type);
    ok = ok && (x !== null) && (x !== undefined);

    let fine = SchemaChecker.composite(type);

    if (ok && fine(x) /*|| (typeof x) === type */ ) {
        return;
    } else {
        throw new TypeError(x + ' must be of type '+type);
    }
}
function check_error(ok_cond, error_code, ...args) {
    const c = CustomErrors[error_code];
    if (!c) {
        throw new TypeError('bad error code: '+error_code);
    }
    if (ok_cond) {
        return;
    } else {
        // const args = [];
        const message = [error_code, ...args].join(' | ');
        console.log('message', message);
        throw new Error(message);
    }
}
// enum
function allow(x, enum_array) {
    // allow_type(x, type)
    check_error(SchemaChecker.is_a.array(enum_array), 'array_of_enum_strings');
    if (enum_array.includes(x)) {
        return;
    } else {
        throw new TypeError(x);
    }
}

//function http_request(verb='POST', hostname='flaviocopes.com', path='/todos', port=443, headers /*, body, cookies*/, body_data) {
function http_request({verb, hostname, path, port, headers, body_data}) {

    allow(verb, ['POST', 'GET', 'PUT']);
    allow_type(hostname, 'string');
    allow_type(path, 'string');
    allow_type(port, 'integer');
    allow_type(headers, 'dict');

    const options = {
      hostname,
      port: port,
      path: path,
      method: verb,
      headers: headers,
      /*{
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }*/
    }
    console.log({options});

    return new Promise( (accept, reject) => {
        const req = https.request(options, (res) => {
           // milestone 2

          console.log(`statusCode: ${res.statusCode}`)

          res.on('data', (response_data) => {
            //process.stdout.write(d);
            // single chunk only?
            accept(response_data);
            // todo: stream promises: multiple accept, and a single END.
            //new concept
          });
        });

        req.on('error', (error) => {
          //console.error(error)
          reject(error);
        })

        req.write(body_data);
        req.end();
        // milestone 1
    });
};

/*
class REResolver {
    constructor(string) {
        ;
    }
};
*/
function REResolver(regexp, args_map, generator) {
    check_error(!(0 in args_map) || args_map[0] === undefined, 'argsmap-should-not-have-0' /* The constraint name!*/ );
    //const that = {};
    /*that.re*/ const the_regexp = new RegExp(regexp);
    const conv_func = (input_string) => {
        console.log('convfunc0 with:', input_string);
        const regexp_matched = the_regexp.exec(input_string);
        if (!regexp_matched) {
            // throw new customError();
            check_error(false, 'resolver-regexp-pattern-did-not-match', input_string);
        }
        const result_obj = {};
        for (const i in args_map) {
            const keyname = args_map[i];
            // i is a number  
            if (keyname === undefined && i === '0') continue;
            result_obj[keyname] = regexp_matched[i];
        }
        lazy_assert_check_equal( Object.keys(result_obj)+'', Object.values(args_map)+'');
        return result_obj;
    };
    this.generate = generator ; // (args) => `${args.prot}://...`;
    this.resolve = conv_func;
    this.inverse = () => {
        const obj = {};
        obj.inverse = () => {
            /*
            const obj2 = {};
            [obj2.generate, obj2.resolve] = [obj.generate, obj.resolve];
            obj2.inverse = () => {throw new Error('I know. not implemented')}
            // won't work
            [obj2.generate, obj2.resolve] = [obj2.resolve, obj2.generate];
            //return obj; //this
            // wrong. OOP is a cetain type of closure.
            //.   in which, this can be swapped. etc.
            // this is a real mess
            return obj2;
            */
            throw new Error('not implemented');
        }
        [obj.generate, obj.resolve] = [this.generate, this.resolve];
        // obj.inverse();
        [obj.generate, obj.resolve] = [obj.resolve, obj.generate];

        return obj;
    }; //: one that reverse

    // interface: generate(), resolve(), inverse()
}

async function main() {
    // note that the '/' that is returned as path is the '/' itself. It is not "reconstructed".
    const URL_RESOLVER = /^([htps]+):\/\/([a-z0-9\.\-]+)(\/.*)$/gm;
    const url_resolver = new REResolver(
            //URL_RESOLVER, [1,2,3]
            URL_RESOLVER, {1:'prot', 2:'hostname', 3:'path'},
            (argsObj) => {
                console.log('gen0', argsObj);
                return `${argsObj.prot}://${argsObj.hostname}${path}`}
        );
    // how to fix this pattern
    // how to force not using 0? (This one is easy)
    // How to make sure info/data is not lost?
    // todo: testcases

    const {hostname, path} = url_resolver.resolve(
      'https://authorise-api.lloydsbank.co.uk/prod01/channel/lyds/.well-known/openid-configuration'
    );
    const port = 443; //80; // how to simplify this code? (default based on 'prot' and whether it is sepcified here in the URL)
    // The resolver extracts the righht information from this.

    lazy_assert_check(hostname === 'authorise-api.lloydsbank.co.uk', 'hostname nok');
    lazy_assert_check(path === '/prod01/channel/lyds/.well-known/openid-configuration', 'path nok');
    const arg_obj = {prot:'https', hostname: 'authorise-api.lloydsbank.co.uk', path:'/prod01/channel/lyds/.well-known/openid-configuration'};
    const gen_url = url_resolver.generate(arg_obj);
    const full_url = 'https://authorise-api.lloydsbank.co.uk/prod01/channel/lyds/.well-known/openid-configuration';
    lazy_assert_check(
        gen_url
            ===
        full_url,
        'generator nok'
    );

    const url_maker = url_resolver.inverse();

    // console.log('>', url_maker.resolve(full_url));

    return http_request({verb: 'GET', hostname, path, port, headers: {}, body_data: 'hello'});
}


async function doit() {
    try {
        await main();
    } catch (e) {
        console.error(e);
    }
}

doit();


// developer portal
// https://developer.lloydsbanking.com/node/592
