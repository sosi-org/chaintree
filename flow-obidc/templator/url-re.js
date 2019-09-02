'use strict';

// const {} = require('../fabrics-shared.js');
const {check_error, allow_type, allow_enum, add_slow_CustomError, lazy_assert_check_equal} = require('../error-checking.js');

add_slow_CustomError('argsmap-should-not-have-0');
add_slow_CustomError('resolver-regexp-pattern-did-not-match');

/*
    generator = (args) => `${args.prot}://...`;
    interface: generate(), resolve(), inverse()
*/
function RegExpResolver(regexp, args_map, generator) {
    "use strict";
    check_error(!(0 in args_map) || args_map[0] === undefined, 'argsmap-should-not-have-0');

    const that = this;
    this.regexp = regexp;
    this.resolve = (input_string) => {
        const the_regexp = new RegExp(that.regexp);
        const regexp_matched = the_regexp.exec(input_string);
        if (!regexp_matched) {
            check_error(false, 'resolver-regexp-pattern-did-not-match', input_string);
        }
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
            (argsObj) => `${argsObj.prot}://${argsObj.hostname}${port?(':'+port):''}${path}`
        );
}

module.exports = {
    UrlRegExp,
};

