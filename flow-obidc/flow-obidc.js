'use strict';

const fabrics = require('./fabrics-shared.js');
const {UrlRegExp, UrlRegExpWithPort, RegExpResolver} = require('./templator/url-re.js');
const {Schema_from_swagger, require_yaml} = require('./templator/swagger2-schema.js');
const {Base64} = require('./templator/base64.js');

function stage(stage_id, minor_step, heading) {
    console.log('---------- stage %d.', stage_id, minor_step, ':', heading);
}

class B64Url {
}

class BinaryBuffer {
    // from/to string utf-8
}

const {util: {base64url_decode_to_binary}} = require('./templator/b64url.js');




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
            // Use RFC7515 to decode JWS

            // b64url_buffer
            const {b64url_buffer} = require('./templator/b64url.js');
            //base64url_decode_to_binary = new b64url_buffer().resoslve
            const b64ubobj = new b64url_buffer();

            // a;; variables must be const. (subclass of javascript)
            const {header, payload, signature} = args;
            const base64 = new Base64();
            const decod64ed_jws = {
                header: base64.resolve(header),
                payload: base64.resolve(payload),
                // signature: base64url_decode_to_binary(signature),
                signature: b64ubobj.resolve(signature),
            };
            // semantics are the same. (Semantics signature).
            //      same type of same name? (args)
            //      This is extra on top of types being the same. 
            // (none of them implies the other).
            // But only being "piped" directly (no branch) + same name means so (not same type))
            console.log('decod64ed_jws', decod64ed_jws);

            // ssa source (input) required (from the upper circuits/circle)
            // const ssa = '??';

            // attach(file, 'pem-file-decoder')

            //const require_pem = (filename) => {}


            class require_pem {
                // dilema. How can this be non-cloning, non-deleting? (reveraible)
                constructor(filename) {
                    const fs = require('fs');
                    const file_content_buffer = fs.readFileSync(filename);
                    // console.log('file_content_buffer', file_content_buffer);
                    this.pem_format = require('pem-file');
                    this.file_content_binarybuffer = file_content_buffer;
                }
                /*
                resolve(nullval) { // file_content_binarybuffer
                    const buffer = pem.decode(this.file_content_binarybuffer);
                    return buffer;
                }
                generate(buffer) {
                    const file_content_binarybuffer = pem.encode(buffer, 'DATA');
                    return file_content_binarybuffer;
                }

                priv_key_source.resolve(); // this is more about generate()

                */
                resolve(buffer) {
                    const file_content_binarybuffer = this.pem_format.encode(buffer, 'DATA');

                    // lazy_assert_check_equal(file_content_binarybuffer, this.file_content_binarybuffer);
                    fabrics.valid_value_as_template_constraint(file_content_binarybuffer, this.file_content_binarybuffer, 'binary contents must be equal');

                    return null;
                }
                generate(nullval) {
                    fabrics.valid_value_as_template_constraint(nullval, null);
                    //try {
                        const buffer = this.pem_format.decode(this.file_content_binarybuffer);
                        return buffer;
                    //} catch (e) {
                    //    console.log('caught');
                    //    throw new Error('constraint error: PEM file has problems: ' +e);
                    //}
                    // work around
                    //return this.file_content_binarybuffer;
                }
            }
            class from_file {
                constructor(filename) {
                    const fs = require('fs');
                    this.file_content_binarybuffer = fs.readFileSync(filename);
                }
                resolve(buffer) {
                    fabrics.valid_value_as_template_constraint(buffer, this.file_content_binarybuffer, 'binary contents must be equal');
                    return null;
                }
                generate(nullval) {
                    fabrics.valid_value_as_template_constraint(nullval, null);
                    return this.file_content_binarybuffer;
                }
            }
            //const pem = require_pem('./sensitive-data/r1_private_key.key');
            // const priv_key_source = new require_pem('./sensitive-data/r1_private_key.key');
            const priv_key_source = new from_file('./sensitive-data/r1_private_key.key');
            const binary_private_key = priv_key_source.generate(null);
            const ssa = binary_private_key; // changin name for semanticss
            console.log('PRIVATE KEY: ', ssa /*, ssa.toString()*/);

            const {sign_verifier_u3} = require('./templator/signer.js')
            // wiring instruction. (w-time!)
            console.log('decod64ed_jws', decod64ed_jws);
            /*
            const decod64ed_jws_header_obj = JSON.parse(decod64ed_jws.header)
            console.log('decod64ed_jws_header_obj', decod64ed_jws_header_obj);
            */
            // partial wiring (resolution) not allowed.
            // combined operations (lookup + parse) not allowed in one statement.

            //const algorithm = decod64ed_jws_header_obj.alg;
            /*
                instead of:
                    const algorithm = decod64ed_jws_header_obj.alg;  // some wiring here. Needs to be made explicit and separated.
                it must be:
                    const {algorithm, kid} = JSON.parse(decod64ed_jws.header);
            */
            // nice: enforces the limitation of direct renaming only.
            const {alg:algorithm, kid} = JSON.parse(decod64ed_jws.header);
            // console.log({algorithm, kid} );

            fabrics.check_flow(algorithm); // checks it is not undefined.
            // note: is RS256. Uses RSASSA: . The following ussage requires this.
            const sr = new sign_verifier_u3({
                algorithm, // never use non-(Shorthand property names)
                key: ssa,  // can rename
            });

            // this flow will be valid only if RSA-SSA is used:
            fabrics.flow_valid_value(sr.type(), 'rsa-ssa', 'RSA-SSA must be used');

            // explicit_type( decod64ed_jws,  {payload: 'string', algorithm: 'string', header: 'string'} )
            // explicit_type(decod64ed_jws.payload, 'string');
            fabrics.flow_valid_type(decod64ed_jws.payload, 'string', 'payload is a string');

            console.log("decod64ed_jws.payload", decod64ed_jws.payload);
            sr.resolve({data: decod64ed_jws.payload, signature: decod64ed_jws.signature});
        })();

    } catch (e) {
        console.error(e);
    }
}

doit();
