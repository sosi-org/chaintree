'use strict';

const fabrics = require('./fabrics-shared.js');
const {UrlRegExp, UrlRegExpWithPort, RegExpResolver} = require('./templator/url-re.js');
const {Schema_from_swagger, require_yaml} = require('./templator/swagger2-schema.js');
const {Base64} = require('./templator/base64.js')

function stage(stage_id, minor_step, heading) {
    console.log('---------- stage %d.', stage_id, minor_step, ':', heading);
}




stage(1,1, 'wellknown point - taken from config');
// todo: use "npm comment-json"
const company_config = require('./company-config.js');

// console.log(company_config);

console.log(company_config.wellknown);

stage(1,2, 'calling the wellknown point');

let {hostname, path, port, prot} = UrlRegExp().resolve(company_config.wellknown);

// bad:
if (port === undefined) {
    port = 443;
}
console.log({hostname, path, port, prot});


const headers = {
    // 'Content-Type': 'application/json',
    // 'Content-Length': data.length,
    /*
    'User-Agent': 'PostmanRuntime/7.15.2',
    'Accept': '*\/*',
    'Cache-Controle': 'no-cache',

    'Host': 'gatewaydata02.psd2.sandbox.extranet.group',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    */
   "cache-control": "no-cache",
   "accept": "application/json",
};

function ignore_https_TLS_SSC_error() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/*
function base64Decode(strData) {
    console.log('strData', strData)
    //deprecated:
    //let buff = new Buffer(strData, 'base64');
    let buff = Buffer.from(strData, 'base64');
    let text = buff.toString('ascii');
    console.log('text64', text)
    return text;
}
*/



async function doit() {
    try {
        stage(1,3, 'calling the wellknown point - cont');
        // ignore_https_TLS_SSC_error();

        // call types/modes:
        const callModes = {TLS_selfsigned: {extra_options: {rejectUnauthorized: false}}};

        const a = await fabrics.http_request(
            {verb: 'GET', hostname, path, port, headers,
            /*, body_data: 'hello'*/ /*body_data: undefined, */
            ...callModes.TLS_selfsigned,
        });
        const jsonated = JSON.parse(a);

        const checker = new Schema_from_swagger(require_yaml('./wellknown.swagger.yaml'));
        //checker.resolve(a);
        checker.resolve(jsonated); // throws if wrong

        stage(1,4, 'finding the `/token` endpoint - from contents from wellknown');

        const token_endpoint = jsonated.token_endpoint;
        console.log("token_endpoint:", token_endpoint);

        stage(2,1, 'calling the `/token` - using clientId');
        const part2 = async () =>{
            // then: prapare:
            // const: (source): given from outise: from company_config
            //      company_config.app is creatd by "App Creation" tasks.
            //          SSA:
            //               Note that they have already provided SSA (in the larger circuit).
            //               SSA has two purposes: 1. certify (Also to arrive to use THROUGH a different ROUTE: form OB). 2. contains info fior us. 
            const ClIdsecretObj = {id: company_config.app.clientId, secret: company_config.app.clientSecret};
            console.log('----',ClIdsecretObj);
            // template code: (generate/reconstruct)
            const ClIdsecret = `${ClIdsecretObj.id}:${ClIdsecretObj.secret}`;
            // a simple transform (again reversible)
            const base64 = new Base64();
            const ClIdsecret64 = base64.generate(ClIdsecret);

            // scopes, grant (and flow) type.
            const body_data = "grant_type=client_credentials&scope=openid accounts";
            // then
            let {hostname, path, port} = new UrlRegExpWithPort().resolve(token_endpoint);
            console.log({hostname, path, port});


            console.log('ClIdsecret64', ClIdsecret64);

            // using hostname, etc enforces use of the full format (typed URL like an OOP object)
            const b = await fabrics.http_request(
                {verb: 'POST', hostname, path, port, headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${ClIdsecret64}`,
                },
                body_data: body_data,
                ...callModes.TLS_selfsigned,
            });
            const bobj = JSON.parse(b);
            const checker = new Schema_from_swagger(require_yaml('./token1.schema.yaml'));
            checker.resolve(bobj); // throws if wrong
            return bobj;
        };
        const token1 = await part2();
        console.log('token1:', token1);

        const access_toekn = token1.access_token;
        console.log('access_toekn:', access_toekn);

        const jws_gktv = new RegExpResolver(
                /^gktvo(.*)$/gm,
                //todo: auto generate this by naming groups:
                // NamedRegExpResolver
                //      /^gktv(?<jws>.*)$/gm,
                {1:'jws'},
                ({jws}) => `gktvo${jws}`
            );
        const jws_str = jws_gktv.resolve(access_toekn);
        console.log('***jws_strjws_str', jws_str);

        const jws_template = new RegExpResolver(
            /^([^\.]*)\.([^\.]*)\.([^\.]*)$/gm,
            //   /^(?<header>[^\.]*)\.(?<payload>[^\.]*)\.(?<signature>[^\.]*)$/
            {1:'header', 2: 'payload', 3: 'signature'},
            ({header, payload, signature}) => `${header}.${payload}.${signature}`
        );
        const args = jws_template.resolve(jws_str.jws);
        console.log(args);

        (()=>{

            // a;; variables must be const. (subclass of javascript)
            const {header, payload, signature} = args;
            const base64 = new Base64();
            const decod64ed_jws = {
                header: base64.resolve(header),
                payload: base64.resolve(payload),
                signature: base64.resolve(signature),
            };
            console.log('decod64ed_jws', decod64ed_jws);

        })();

    } catch (e) {
        console.error(e);
    }
}

doit();
