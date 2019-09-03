'use strict';

// const {} = require('../fabrics-shared.js');
const {check_error, allow_type, allow_fixed_special_only, allow_enum, add_slow_CustomError, lazy_assert_check_equal} = require('../error-checking.js');

add_slow_CustomError('argsmap-should-not-have-0');
add_slow_CustomError('resolver-regexp-pattern-did-not-match');
add_slow_CustomError('must-be-defined');
/*
    generator = (args) => `${args.prot}://...`;
    interface: generate(), resolve(), inverse()

    constructor. USe with "new".
*/
function RegExpResolver(regexp, args_map, generator) {
    "use strict";
    check_error(!(0 in args_map) || args_map[0] === undefined, 'argsmap-should-not-have-0');

    const that = this;
    this.regexp = regexp;
    this.resolve = (input_string) => {
        console.log('33input_string', input_string);
        check_error(typeof input_string !== 'undefined', 'must-be-defined');
        const the_regexp = new RegExp(that.regexp);
        const regexp_matched = the_regexp.exec(input_string);
        if (!regexp_matched) {
            check_error(false, 'resolver-regexp-pattern-did-not-match', input_string);
        }
        //console.log('regexp_matched', regexp_matched)
        const result_obj = {};
        for (const i in args_map) {
            const keyname = args_map[i];
            // i is a number
            if (keyname === undefined && i === '0') {
                continue;
            }
            result_obj[keyname] = regexp_matched[i];
        }
        lazy_assert_check_equal( Object.keys(result_obj)+'', Object.values(args_map)+'');
        return result_obj;
    };
    this.generate = generator; // () => throw new Error('not implemented');

}

function UrlRegExp() {

    const URL_RESOLVER = /^([htps]+):\/\/([a-z0-9\.\-]+)(:\d+)?(\/.*)$/gm;

    //todo: typed args
    // todo: default: return empty string instead of undefined. => it is reconstructable.

    /*
    It is important to dissociate between unmatched error (i.e. for any reason) with deliberately missng value (implicit).
    That's why smpty string is necessary.
    In the new RegExp language, this needs to be systematic.
    Another reason the current RegExp is rubish for this purpose.
    */


    return new RegExpResolver(
            URL_RESOLVER,
            {1:'prot', 2:'hostname', 3: 'port', 4:'path'},
            (argsObj) => `${argsObj.prot}://${argsObj.hostname}${argsObj.port?(':'+argsObj.port):''}${argsObj.path}`
        );
}

/*
    constructor/class

    I see. This is the problem: It is not reversible.
*/
function MapDefaultPort() {
    "use strict";
    this.resolve = ({prot, port}) => {
        console.log('6', {prot, port});
        if (port) {
            return port;
        }
        console.log('7');
        // todo: assure_type  allow_type
        allow_fixed_special_only(port, undefined);
        // for now, inly http and https are supported
        // a bottleneck
        allow_enum(prot, ['http', 'https']);
        console.log('8');

        // separate nice compact object for this (const. config)
        const defaults = {http: 80, https: 443};

        return defaults[prot];
    }
    this.generate = () => {
        throw new Error('not reversible');
    }
}

function UrlRegExpWithPort() {
    "use strict";

    const ur = UrlRegExp();

    const dp = new MapDefaultPort();

    this.resolve = (input_string) => {
        console.log('22input_string', input_string)
        const a = ur.resolve(input_string);
        console.log('4a', a);
        // chain. as separate step (stage)s.
        const newport = dp.resolve({port: a.port, prot:a.prot});
        console.log('5', a, newport);
        // bad idea: replaced the original object
        a.port = newport;

        return a;
    }

    // argsObj
    this.generate = ({hostname, path, port, prot}) =>
        `${prot}://${hostname}${port?(':'+port):''}${path}`;
    // the bit about default port is lost.
    // However, It should be fine. Because no port will be changed to 80, which is fine.

    // a chain will not only chain the 'resolve()'s but also the reverse direciton: the 'generate()'s
}


function test_UrlRegExpWithPort() {
    const t = new UrlRegExpWithPort();
    const argObj = t.resolve('http://yahoo.com/');
    const reconstructed = t.generate(argObj);
    // empty path must be empty string
    lazy_assert_check_equal(reconstructed, 'http://yahoo.com:80/');
}

// if (test)
test_UrlRegExpWithPort();

module.exports = {
    UrlRegExp,
    UrlRegExpWithPort,
};

