'use strict';

const {requiret, fabrics } = require(__dirname + '/../templators/requiret.js');

const {Schema_from_swagger, require_yaml} = requiret('swagger2-schema.js');

const {from_file} = requiret('from_file.js');
// console.log( new from_file('./jws/1_public.key') );
//const {all_non_undefined}  = require('./error-checking.js');

// components
const {component_jws_verifysignature, accesstoken_from_gktvo} = require('./jwt_tools.js');
const {call_post_style_1, style_3_call__POST_bearer_matls, call_get_style1} = require('./rest.js');

const {check_format_keys} = fabrics;

function stage(stage_id, minor_step, heading) {
    console.log('---------- stage %d.', stage_id, minor_step, ':', heading);
}

class B64Url {
}

class BinaryBuffer {
    // from/to string utf-8
}

// todo: refactor. utils?
const {util: {base64url_decode_to_binary}} = requiret('b64url.js');



const part2 = async (token_endpoint, {clientId,clientSecret}, body_data) =>{
    stage(2,1, 'calling the `/token` - using clientId');

    // me:
    // necesary objects. not more. (extension of no-move/no-cloning)

    // bottleneck:
    //     (token_endpoint, {clientId, clientSecret}, body_data = "grant_type=client_credentials&scope=openid accounts";)

    /*
        token_endpoint
        (clientId, clientSecret),
        querystring.parse('grant_type=client_credentials&scope=openid accounts')
        querystring.stringify({ grant_type: 'client_credentials', scope: 'openid accounts' })
    */

    // then: prapare:
    // const: (source): given from outise: from company_config
    //      company_config.app_id_secret is creatd by "App Creation" tasks.
    //          SSA:
    //               Note that they have already provided SSA (in the larger circuit).
    //               SSA has two purposes: 1. certify (Also to arrive to use THROUGH a different ROUTE: form OB). 2. contains info fior us. 

    // // scopes, grant (and flow) type.
    // const body_data =


    const key_cert_tuple = require(
        './sensitive-data/SIT01-OBIE/cached-data/ma-tls-1.js',
    );
    // console.log('key_cert_tuple***', key_cert_tuple);

    const b = await call_post_style_1(token_endpoint, {clientId,clientSecret}, body_data, key_cert_tuple);

    const bobj = JSON.parse(b);
    const checker = new Schema_from_swagger(require_yaml('./token1.schema.yaml'));
    checker.resolve(bobj); // throws if wrong
    return bobj;

    //} catch(non200) {
    //    console.log('1. none-200 status:', non200);
    //    process.exit(1);
    //}
};




async function part5(uri, access_token /*, SOURCES*/) {
    // See line 131
    // call 3:
    stage(5,1, 'call the `/account-access-consents` - using bearer access_token and TLS certs');

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
        /*
        matls_key_filename: './sensitive-data/SIT01-OBIE/cached-data/aka_transport.key',
        matls_cert_filename: './sensitive-data/SIT01-OBIE/cached-data/aka_transport.pem',
        */
        // matls_key_filename: './sensitive-data/SIT01-OBIE/cached-data/ob-harness-certs/SIT01_apie-transport.key',
        //matls_cert_filename: './sensitive-data/SIT01-OBIE/cached-data/ob-harness-certs/SIT01_apie-transport.pem',
        // html: You don't have permission to access ... on this server

        // matls_key_filename: './sensitive-data/SIT01-OBIE/cached-data/ob-harness-certs/sit01-akamai-transport.key',
        // matls_cert_filename: './sensitive-data/SIT01-OBIE/cached-data/ob-harness-certs/sit01-akamai-transport.pem',
        // "UK.OBIE.Field.Missing","Message":"x-fapi-financial-id is missing in the request."}]}

        matls_key_filename: './sensitive-data/SIT01-OBIE/cached-data/ob-harness-certs/SIT01_akamai_transport.key',
        matls_cert_filename: './sensitive-data/SIT01-OBIE/cached-data/ob-harness-certs/SIT01_akamai_transport.pem',
        // Bad Request","error":"Invalid DN"

    };
    const matls_key = new from_file(SOURCES.matls_key_filename).generate(null).toString();
    const matls_cert = new from_file(SOURCES.matls_cert_filename).generate(null).toString();
    const key_cert_tuple = {key: matls_key, cert: matls_cert};



    // const b1 = await call_get_style1()
    const b = await style_3_call__POST_bearer_matls({
        url: uri,
        body_obj: body,
        bearertype_token: access_token,
        key_cert_tuple,
    });
    // Status none-200: 400 (Bad Request)
    console.log('response to: ', uri);
    console.log(b);
    console.log('*************@£$@£$*');
    process.exit(0);
}




async function doit() {
    try {
        stage(1,1, 'wellknown point - taken from config');
        // todo: use "npm comment-json"
        const company_config = require('./company-config.js');
        console.log(company_config.wellknown);

        stage(1,2, 'calling the wellknown point');
        const a = await call_get_style1(company_config.wellknown);
        const jsonated = JSON.parse(a);
        const checker = new Schema_from_swagger(require_yaml('./wellknown.swagger.yaml'));
        //checker.resolve(a);
        checker.resolve(jsonated); // throws if wrong

        stage(1,4, 'finding the `/token` endpoint - from contents from wellknown');
        const token_endpoint = jsonated.token_endpoint;
        console.log("token_endpoint:", token_endpoint);

        stage(2,1, 'hitting the `/token` endpoint: i.e. first token call - to get the first token1jws');
        // scopes, grant (and flow) type.
        const body_data = "grant_type=client_credentials&scope=openid accounts";
        const tokencall1_resp = await part2(token_endpoint, company_config.app_id_secret, body_data);
        console.log('token from first /token call:', tokencall1_resp);

        console.log('tokencall1_resptokencall1_resp', tokencall1_resp);
        // check_format_keys()

        check_format_keys(tokencall1_resp,
            `{token_type, access_token, expires_in, consented_on, scope}`
        );


        // {token_type, access_token,expires_in,consented_on,scope,openid accounts} = 
        // fully verify:
        // {token_type: 'Bearer'}
        // {"scope":"openid accounts"}
        const access_toekn_gktvo = tokencall1_resp.access_token;
        console.log('access_toekn_gktvo:', access_toekn_gktvo);
        const access_token__jws_string =  accesstoken_from_gktvo(access_toekn_gktvo);

        {
            const access_token__jws_string__reproduced = component_jws_verifysignature(
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
        }

        // How to make sure the names are chosen correctly
        const access_token = access_token__jws_string;

        // Where does SSA stand?


        const account_access_consents_url = company_config["account-access-consents"]({obver: 'v3.1'});
        part5(account_access_consents_url, access_token);

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
