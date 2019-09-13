'use strict';

const {Schema_from_swagger, require_yaml} = require('../templator/swagger2-schema.js');
const {check_format_keys} = require('../fabrics-shared.js');
const {from_file} = require('../templator/from_file.js');

// components
const {component_jws_verifysignature, accesstoken_from_gktvo} = require('../jwt_tools.js');
const {call_post_style_1, style_3_call__POST_bearer_matls, call_get_style1} = require('../rest.js');


function stage(stage_id, minor_step, heading) {
    console.log('---------- stage %d.', stage_id, minor_step, ':', heading);
}

const SOURCES = {
    KEYS: {
        TLS: {
            tokenEP: {
                // require
                token_tls_certs: '../sensitive-data/SIT01-OBIE/cached-data/ma-tls-1.js',
            },
            aisp1: {
                matls_key_filename: '../sensitive-data/SIT01-OBIE/cached-data/aka_transport.key',
                matls_cert_filename: '../sensitive-data/SIT01-OBIE/cached-data/aka_transport.pem',
            },
        },
        ssa2pubky_pemfile: '../sensitive-data/SIT01-OBIE/cached-data/ssa-jws-pubkey.pem',
    },
    // always require() only:
    COMPILED_DATA: {
        company_config: '../company-config.js',
    },
}

const FILES = {
    formats: {
        // require_yaml
        token_schema: '../token1.schema.yaml',
        wellknown_schema: '../wellknown.swagger.yaml',
    },
}

const part2 = async (token_endpoint, {clientId,clientSecret}, body_data) =>{
    stage(2,1, 'calling the `/token` - using clientId');

    const key_cert_tuple = require(SOURCES.KEYS.TLS.tokenEP.token_tls_certs);

    const b = await call_post_style_1(token_endpoint, {clientId,clientSecret}, body_data, key_cert_tuple);

    const bobj = JSON.parse(b);
    const checker = new Schema_from_swagger(require_yaml(FILES.formats.token_schema));
    checker.resolve(bobj); // throws if wrong
    return bobj;
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

    const matls_key = new from_file(SOURCES.KEYS.TLS.aisp1.matls_key_filename).generate(null).toString();
    const matls_cert = new from_file(SOURCES.KEYS.TLS.aisp1.matls_cert_filename).generate(null).toString();
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

// jsonizer
class JSONner {
    generate(json_string) {
        return JSON.parse(json_string);
    }
    resolve(obj) {
        return JSON.stringify(obj);

    }
}
class JSON1 {
    resolve(json_string) {
        return JSON.parse(json_string);
    }
    generate(obj) {
        return JSON.stringify(obj);
    }
}

async function doit() {
    try {
        stage(1,1, 'wellknown point - taken from config');
        // todo: use "npm comment-json"
        const company_config = require(SOURCES.COMPILED_DATA.company_config );

        stage(1,2, 'calling the wellknown point');
        const jsonated = await call_get_style1(company_config.wellknown);
        //const wellknownObj = JSON.parse(jsonated); //new JSONner().generate()
        const wellknownObj = new JSON1().resolve(jsonated);

        const checker = new Schema_from_swagger(require_yaml(FILES.formats.wellknown_schema));
        checker.resolve(wellknownObj); // throws if wrong

        stage(1,4, 'finding the `/token` endpoint - from contents from wellknown');
        const {token_endpoint, authorization_endpoint} = wellknownObj;

        stage(2,1, 'hitting the `/token` endpoint: i.e. first token call - to get the first token1jws');
        // scopes, grant (and flow) type.
        const body_data = "grant_type=client_credentials&scope=openid accounts";
        const tokencall1_resp = await part2(token_endpoint, company_config.app, body_data);
        console.log('token from first /token call:', tokencall1_resp);

        console.log('tokencall1_resptokencall1_resp', tokencall1_resp);
        // check_format_keys()

        check_format_keys(tokencall1_resp,
            `{token_type, access_token, expires_in, consented_on, scope}`
        );


        const access_toekn_gktvo = tokencall1_resp.access_token;
        console.log('access_toekn_gktvo:', access_toekn_gktvo);
        const access_token__jws_string =  accesstoken_from_gktvo(access_toekn_gktvo);

        {
            const access_token__jws_string__reproduced = component_jws_verifysignature(
                access_token__jws_string,
                {key_filename: SOURCES.KEYS.ssa2pubky_pemfile}
            );
            console.log({access_token__jws_string__reproduced});
        }

        const access_token = access_token__jws_string;

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
