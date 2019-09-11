'use strict';

const fabrics = require('./fabrics-shared.js');
const {extract_the_only_field} = require('./fabrics-shared.js');
const {UrlRegExp, UrlRegExpWithPort, RegExpResolver} = require('./templator/url-re.js');
const {Schema_from_swagger, require_yaml} = require('./templator/swagger2-schema.js');
const {Base64} = require('./templator/base64.js');
const {from_file} = require('./templator/from_file.js');
// console.log( new from_file('./jws/1_public.key') );
const {all_non_undefined}  = require('./error-checking.js');

function stage(stage_id, minor_step, heading) {
    console.log('---------- stage %d.', stage_id, minor_step, ':', heading);
}

class B64Url {
}

class BinaryBuffer {
    // from/to string utf-8
}

const {util: {base64url_decode_to_binary}} = require('./templator/b64url.js');



const part2 = async (token_endpoint, company_config_app, body_data) =>{
    stage(2,1, 'calling the `/token` - using clientId');

    // me:
    // necesary objects. not more. (extension of no-move/no-cloning)

    // bottleneck:
    //     (token_endpoint, company_config.app.clientId, company_config.app.clientSecret, body_data = "grant_type=client_credentials&scope=openid accounts";)

    /*
        token_endpoint
        (company_config.app.clientId, company_config.app.clientSecret),
        querystring.parse('grant_type=client_credentials&scope=openid accounts')
        querystring.stringify({ grant_type: 'client_credentials', scope: 'openid accounts' })
    */

    // then: prapare:
    // const: (source): given from outise: from company_config
    //      company_config.app is creatd by "App Creation" tasks.
    //          SSA:
    //               Note that they have already provided SSA (in the larger circuit).
    //               SSA has two purposes: 1. certify (Also to arrive to use THROUGH a different ROUTE: form OB). 2. contains info fior us. 
    const ClIdsecretObj = {id: company_config_app.clientId, secret: company_config_app.clientSecret};
    console.log('----',ClIdsecretObj);
    // template code: (generate/reconstruct)
    const ClIdsecret = `${ClIdsecretObj.id}:${ClIdsecretObj.secret}`;
    // a simple transform (again reversible)
    const base64 = new Base64();
    const ClIdsecret64 = base64.generate(ClIdsecret);

    // // scopes, grant (and flow) type.
    // const body_data =
    // then
    let {hostname, path, port} = new UrlRegExpWithPort().resolve(token_endpoint);
    console.log({hostname, path, port});


    // console.log('ClIdsecret64', ClIdsecret64);


    const key_cert_tuple = require(
        './sensitive-data/SIT01-OBIE/cached-data/ma-tls-1.js',
    );
    // console.log('key_cert_tuple***', key_cert_tuple);

    //console.log('****11');
    //try{
    // using hostname, etc enforces use of the full format (typed URL like an OOP object)
    const opt = {
        verb: 'POST', hostname, path, port, headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${ClIdsecret64}`,
        },
        body_data: body_data,
        ...fabrics.callModes.TLS_selfsigned,
        //...fabrics.callModes.matls_keycert({key, cert}),
        ...fabrics.callModes.matls_keycert(key_cert_tuple),
    };
    /* ??
        "rejectUnauthorized": false,
        "followRedirect": false
    */

    // console.log('****opt', opt);
    const b = await fabrics.http_request( opt );
    // console.log('****222');
    const bobj = JSON.parse(b);
    const checker = new Schema_from_swagger(require_yaml('./token1.schema.yaml'));
    checker.resolve(bobj); // throws if wrong
    return bobj;
    //} catch(non200) {
    //    console.log('1. none-200 status:', non200);
    //    process.exit(1);
    //}
};


// only verifies
function component_jws(jws_string, SOURCES) {

    const jws_template = new RegExpResolver(
        /^([^\.]*)\.([^\.]*)\.([^\.]*)$/gm,
        //   /^(?<header>[^\.]*)\.(?<payload>[^\.]*)\.(?<signature>[^\.]*)$/
        {1:'header', 2: 'payload', 3: 'signature'},
        ({header, payload, signature}) => `${header}.${payload}.${signature}`
    );

    const args = jws_template.resolve(jws_string);
    console.log('33333333333');
    console.log(args);

    const part4 = ()=>{
        // Use RFC7515 to decode JWS

        /*
            inputs:
                args = (provides the resolved jws).
            SOURCES: (filenames as references. Are reference to "labelled-lines". The (flow/circuit of the) content of files need to be determined later.)
                key file (provides SSA)

            orphan outputs: kid
        */
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
        //const pem = require_pem('./sensitive-data/r1_private_key.key');
        // const priv_key_source = new require_pem('./sensitive-data/r1_private_key.key');
        const priv_key_source = new from_file(SOURCES.key_filename);
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

        //console.log("decod64ed_jws.payload", decod64ed_jws.payload);
        const header_payload_tuple = new RegExpResolver(
              /^([^\.]*)\.([^\.]*)$/gm,
              {1:'header', 2: 'payload'},
              ({header, payload}) => `${header}.${payload}`
        );
        // this is the non-reversible part:
        const partial_info = {header: args.header, payload: args.payload};
        // how to make this "partial_info" reversible?

        const _signee = header_payload_tuple.generate(partial_info);
        const _signature = args.signature;

        // const q4 = sr.resolve({data: decod64ed_jws.payload, signature: decod64ed_jws.signature});
        const reproduced = sr.resolve({data: _signee, signature: _signature});

        console.log('4444444 reproduced', reproduced);
        return reproduced;
    };

    const jws = part4();
    /*
    now I have a `jws`
        the proper format should be:
            writing the output vasriable "after" the funciton call.
            For example:
                part4() >> jws;  // jws is undefined. It is defined here
                part4() >> jws;  // jws is undefined. It is defined here
                const part4() >> ?jws;  // The question mark marks it as the new variable (applied the "const" to it. The scope will be determined by the locaiton of the const on the left hand side.).
    */
   return jws;
}

async function style_3_call__POST_bearer_matls({url, body_obj, bearertype_token, key_cert_tuple}) {
    // Request features: {POST, Bearer, MATLS}.
    //      ..which will require: (url, body, token, (key,cert) )
    //           ..consequences:
    //                 "application/json" // body is json

    // Lesson: Every single call requires its key&cert. Each subsystem (AISP versus Token) has its own.

    // how to enfirce exact match (no miss (unmentioned), no undefined)
    const /*url_tuple*/ {hostname, path, port, prot} =
        new UrlRegExpWithPort().resolve(url);
    // warn: unused. Easy using -like tools.

    const body_data = JSON.stringify(body_obj);

    console.log('https://' + hostname + ':' + port + path);
    const opt = {
        verb: 'POST',
        hostname, path, port,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer gktvo${bearertype_token}`,
            // "Accept": "",  meaning = ?
            /*
            ...{
                "Accept":"",
                "x-fapi-financial-id":"test",
                "x-fapi-customer-last-logged-time":"Sun, 10 Sep 2017 19:43:31 UTC",
                "x-fapi-customer-ip-address":"104.25.212.99",
                "X-Test-DCRK":"true",
                "X-Test-DCP2":"true",
                "x-lbg-accountRequest-vip":"accountRequestVIPHeader",
                "x-idempotency-key":"FRESCO.21302.GFX.20",
                // "content-length":515
                "content-length": body_data.length,
            },
            */
        },
        body_data,
        //followRedirect:false,
        ...fabrics.callModes.TLS_selfsigned,
        ...fabrics.callModes.matls_keycert(key_cert_tuple),
        // followRedirect=false, ciphers:All

        /*
        ...{
            "rejectUnauthorized": false,
            "json": true,
            "followRedirect": false,
            "resolveWithFullResponse": true,
            "secureProtocol": "TLSv1_2_method",
            "securityOptions": "SSL_OP_NO_SSLv3",
            "ciphers": "ALL",
        },
        */
    };

    // console.log('http*opt', opt);
    const b = await fabrics.http_request( opt );

}

async function part5(company_config_temp, access_token /*, SOURCES*/) {
    // See line 131
    // call 3:

    const uri = company_config_temp["account-access-consents"]({obver: 'v3.1'});

    const moment = require('moment');
    const now = new moment();
    const now_detailed = now.format();
    const exp_time_detailed = now.add(3,'months').format();
    const body = {
		"Data": {
			"Permissions": [
				"ReadAccountsBasic",
				"ReadAccountsDetail",
				"ReadBalances",
				"ReadTransactionsDetail",
				"ReadTransactionsCredits",
				"ReadTransactionsDebits",
				"ReadProducts",
				"ReadDirectDebits",
				"ReadBeneficiariesBasic",
				"ReadBeneficiariesDetail",
				"ReadStandingOrdersBasic",
				"ReadStandingOrdersDetail",
				"ReadScheduledPaymentsBasic",
				"ReadScheduledPaymentsDetail"
            ],
            // Why does the client ask for the times?
            // Why is it in past?
			"ExpirationDateTime": exp_time_detailed, //"2019-12-08T14:26:21Z",
			"TransactionFromDateTime": now_detailed, //"2016-09-10T19:31:21+01:00",
			"TransactionToDateTime": now_detailed,   //"2019-09-10T19:31:21+01:00"
		},
		"Risk": {}
	};

    /*
    // 202 characters
    const what1_token = new from_file(
        './sensitive-data/SIT01-OBIE/cached-data/what-3.txt'
    ).generate(null);
    console.log('what1_token', what1_token.length, what1_token);
    */

    /*
    const key_cert_tuple = require(
        './sensitive-data/SIT01-OBIE/cached-data/ma-tls-2.js',
        // './sensitive-data/SIT01-OBIE/cached-data/ma-tls-3.js',
    );
    */

    const SOURCES = {
        matls_key_filename: './sensitive-data/SIT01-OBIE/cached-data/aka_transport.key',
        matls_cert_filename: './sensitive-data/SIT01-OBIE/cached-data/aka_transport.pem',
    };
    const matls_key = new from_file(SOURCES.matls_key_filename).generate(null).toString();
    const matls_cert = new from_file(SOURCES.matls_cert_filename).generate(null).toString();
    const key_cert_tuple = {key: matls_key, cert: matls_cert};

    const b = await style_3_call__POST_bearer_matls({
        url: uri,
        body_obj: body,
        bearertype_token: access_token,
        key_cert_tuple,
    });
    // Status none-200: 400 (Bad Request)
    console.log('response to: ', uri);
    console.log(b);
    process.exit(0);
}

stage(1,1, 'wellknown point - taken from config');
// todo: use "npm comment-json"
const company_config = require('./company-config.js');
// part5(company_config)

// console.log(company_config);

console.log(company_config.wellknown);

stage(1,2, 'calling the wellknown point');

let {hostname, path, port, prot} = UrlRegExp().resolve(company_config.wellknown);

// bad:
if (port === undefined) {
    port = 443;
}
// console.log({hostname, path, port, prot});
//todo: check not undefined.
all_non_undefined({hostname, path, port, prot});

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


        const a = await fabrics.http_request(
            {verb: 'GET', hostname, path, port, headers,
            /*, body_data: 'hello'*/ /*body_data: undefined, */
            ...fabrics.callModes.TLS_selfsigned,
        });
        const jsonated = JSON.parse(a);

        const checker = new Schema_from_swagger(require_yaml('./wellknown.swagger.yaml'));
        //checker.resolve(a);
        checker.resolve(jsonated); // throws if wrong

        stage(1,4, 'finding the `/token` endpoint - from contents from wellknown');

        const token_endpoint = jsonated.token_endpoint;
        console.log("token_endpoint:", token_endpoint);



        // scopes, grant (and flow) type.
        const body_data = "grant_type=client_credentials&scope=openid accounts";

        const tokencall1_resp = await part2(token_endpoint, company_config.app, body_data);
        // console.log('22222222222');
        console.log('token from first /token call:', tokencall1_resp);

        // {token_type, access_token,expires_in,consented_on,scope,openid accounts} = 
        // fully verify:
        // {token_type: 'Bearer'}
        // {"scope":"openid accounts"}
        const access_toekn_gktvo = tokencall1_resp.access_token;
        console.log('access_toekn_gktvo:', access_toekn_gktvo);

        // Produce a 'gktvo' Bearer
        const jws_gktv = new RegExpResolver(
                /^gktvo(.*)$/gm,
                //todo: auto generate this by naming groups:
                // NamedRegExpResolver
                //      /^gktv(?<jws>.*)$/gm,
                {1:'jws'},
                ({jws}) => `gktvo${jws}`
            );
        const jws_argObj = jws_gktv.resolve(access_toekn_gktvo);
        console.log('***jws_argObj', jws_argObj);

        // access_token__jws_string is the access_token

        //SSA = ...
        // simple flow binding (single-arg)
        // const access_token__jws_string = jws_argObj.jws;
        const access_token__jws_string = extract_the_only_field(jws_argObj, 'jws');

        const access_token__jws_string__reproduced = component_jws(
            access_token__jws_string,
            //'./sensitive-data/sit01-obwac/luat01-token.key????'
            // ./sensitive-data/SIT02-OBIE/cached-data/...
            {key_filename: './sensitive-data/SIT01-OBIE/cached-data/ssa-jws-pubkey.pem'}
        );

        console.log({access_token__jws_string__reproduced});
        // Why a JWS is sent to the client?
        //     by the token endpoint (first call)
        // The client needs to be able to validate it?
        //

        // How to make sure the names are chosen correctly
        const access_token = access_token__jws_string;

        // Where does SSA stand?


        part5(company_config, access_token);

    } catch (e) {
        console.error(e);
    }
}

//doit();

async function doit0() {
    try {
        await doit();
    } catch(non200) {
        console.log('1. none-200 status:', non200);
        process.exit(1);
    }
}


// a doit() wrapped in try-catch
doit0();
