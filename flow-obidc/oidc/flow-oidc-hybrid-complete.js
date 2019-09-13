'use strict';

const {Schema_from_swagger, require_yaml} = require('../templator/swagger2-schema.js');
const {check_format_keys} = require('../fabrics-shared.js');
const {from_file} = require('../templator/from_file.js');
const {FullUrlWithQueryHash} = require('../templator/url-re.js');

// components
const {component_jws_verifysignature, accesstoken_from_gktvo} = require('../jwt_tools.js');
const {
    call_post_style_1, style_3_call__POST_bearer_matls, style_5_call__POST_tinfo_matls,
    call_get_style1, call_get_style2
} = require('../rest.js');

const {Base64} = require('../templator/base64.js');

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

const part2 = async (token_endpoint, {clientId,clientSecret}, body_data, SOURCES) =>{
    stage(2,1, 'calling the `/token` - using clientId');

    const key_cert_tuple = require(SOURCES.KEYS.TLS.tokenEP.token_tls_certs);

    const b = await call_post_style_1(token_endpoint, {clientId,clientSecret}, body_data, key_cert_tuple);

    const bobj = JSON.parse(b);
    const checker = new Schema_from_swagger(require_yaml(FILES.formats.token_schema));
    checker.resolve(bobj); // throws if wrong
    return bobj;
};




async function part6(uri, access_token /*, SOURCES*/) {
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
/**
 * num_bytes typically: 16
 */
function produce_nonce_en64(num_bytes) {
    const crypto = require('crypto');
    let nonce = crypto.randomBytes(num_bytes).toString('base64');
    return nonce;
}
async function doit() {
    try {
        stage(1,1, 'wellknown point - taken from config');
        // todo: use "npm comment-json"
        const company_config = require(SOURCES.COMPILED_DATA.company_config );

        stage(1,2, 'calling the wellknown point');
        const jsonated = await call_get_style1(company_config.wellknown);
        const wellknownObj = new JSON1().resolve(jsonated);

        const checker = new Schema_from_swagger(require_yaml(FILES.formats.wellknown_schema));
        checker.resolve(wellknownObj); // throws if wrong
        console.log('wellknown:', wellknownObj);

        // ****
        const {token_endpoint, authorization_endpoint} = wellknownObj;

        stage(2,1, 'hitting the `/token` endpoint: i.e. first token call - to get the first token1jws');
        // scopes, grant (and flow) type.
        // + sign works?
        const body_data = "grant_type=client_credentials&scope=openid+accounts";
        // bad name: company_config
        const tpp_idsecret_creds = company_config.app_id_secret;
        const tokencall1_resp = await part2(token_endpoint, tpp_idsecret_creds, body_data, SOURCES);
        check_format_keys(tokencall1_resp, `{token_type, access_token, expires_in, consented_on, scope}`);
        const access_toekn_gktvo = tokencall1_resp.access_token;
        const access_token__jws_string =  accesstoken_from_gktvo(access_toekn_gktvo);
        delete tokencall1_resp.access_token;
        // {token_type, access_token__jws_string, expires_in, consented_on, scope}

        {
            const access_token__jws_string__reproduced = component_jws_verifysignature(
                access_token__jws_string,
                {key_filename: SOURCES.KEYS.ssa2pubky_pemfile}
            );
            console.log({access_token__jws_string__reproduced});
        }


        const access_token = access_token__jws_string;

        console.log('access_token=========');
        console.log(access_token)

        // const account_access_consents_url = company_config["account-access-consents"]({obver: 'v3.1'});
        //part5(account_access_consents_url, access_token);

        console.log(authorization_endpoint);
        // part6(authorization_endpoint, access_token);

        console.log('tpp_idsecret_creds', tpp_idsecret_creds);
        // >>   instead of defining a once-only-use local variable
        // from up

        const state = '12345';
        const nonce = 'n-0S6_WzA2Mj' || produce_nonce_en64(6+2); // e.g. 
        //'n-0S6_WzA2Mj'
        //'EMKCSuTn'
        const response_type = 'code id_token';
        const redirect_uri = require('../sensitive-data/SIT01-OBIE/cached-data/temporarily_jws.js')['redirect_uri'];
        const scope = 'openid accounts';
        const ssa_jws = require('../sensitive-data/SIT01-OBIE/cached-data/temporarily_jws.js')['q'];
        const q_exp = require('../sensitive-data/SIT01-OBIE/cached-data/temporarily_jws.js')['q_exp'];

        const qs = require('querystring');
        const qo = {
            response_type,
            client_id: tpp_idsecret_creds.clientId,
            state,
            nonce,
            redirect_uri,
            scope,
            request: ssa_jws
        };
        // const qstr = qs.stringify(qo, '&', '=', {encodeURIComponent: str => str});
        const qstr = qs.stringify(qo);

        console.log( qstr );
        console.log('===?');
        console.log( q_exp );
        /*
        if(!( encodeURIComponent(q_exp) === qstr)) {
            throw new Error('expectation failed');
        }
        */


        /*
        const img_buffer = await call_get_style2('https://httpbin.org/image', 'image/*');
        console.log(img_buffer);
        const fs = require('fs');
        fs.writeFileSync('./image.png', img_buffer);
        console.log('saved');
        return;
        */

        const full_get_url = authorization_endpoint +'?' + qstr;
        // const full_get_url = "https://httpbin.org/absolute-redirect/3";
        console.log('GET:', full_get_url);
        // const /*jsonated2*/ resp_buf
        // todo: wrap in a special one made for redirecting
        // fixme: the html output body is binary junk
        const {statusCode, statusMessage, headers, response_buffer} = await call_get_style2(full_get_url, 'text/html');
        // const wellknownObj2 = new JSON1().resolve(jsonated2);
        console.log('resp_buf:GET::', typeof response_buffer);
        console.log('resp_buf:GET::', response_buffer);
        // { "httpCode":"302", "httpMessage":"Found", "moreInformation":"null" }
        // The HTTP response status code 302 Found is a common way of performing URL redirection. 
        console.log('resp_buf:GET::', response_buffer.toString('utf-8'));

        const fs = require('fs');
        fs.writeFileSync('./binary.binary', response_buffer);
        console.log('saved');

        console.log({statusCode, statusMessage, headers, response_buffer});

        // templator should verify this code.
        if (statusCode === 302) {
            console.log('now following', headers.location);
        } else {
            throw new TemplatorConstraintError('must be a redirect response.');
        }

        // https://sit01-authorise-api.lloydsbank.co.uk/sit01/channel/lyds/consent-preauth-validation-service/v1.0/consent?original-url=https%3A...
        // https://domain/consent-preauth-validation-service/v1.0/consent?...
        const consent_preauth_validation_service__consent = headers.location;

        const temp = new FullUrlWithQueryHash().resolve(consent_preauth_validation_service__consent);
        const {prot, hostname, port, path, query_string, hash} = temp;
        console.log(temp.query_string)
        const qsObj = qs.parse(query_string);
        console.log(qsObj);

        const {
            'original-url':original_url,appid,org,orgtitle,orgid,
            provider,providertitle,providerid,catalog,
            catalogtitle,catalogid,
            'g-transid': g_transid, transid
        } = qsObj;

        {
            console.log('GET2: ',consent_preauth_validation_service__consent)
        const {statusCode, statusMessage, headers, response_buffer} = await call_get_style2(
            consent_preauth_validation_service__consent,
            // 'text/html'
            // 'text/plain'
            'text/*'
            );
        console.log({statusCode, statusMessage, headers, response_buffer});
        // 406 Not Acceptable
        console.log(response_buffer.toString())
        console.log('-------\n');

        {
        const cwa_aisp_consent_url_qs = headers.location;
        console.log('\n --------\n');
        console.log(cwa_aisp_consent_url_qs);

        const temp = new FullUrlWithQueryHash().resolve(cwa_aisp_consent_url_qs);
        const {prot, hostname, port, path, query_string, hash} = temp;
        console.log(temp.query_string)
        const qsObj = qs.parse(query_string);
        console.log('\n ==============\n');
        console.log(qsObj);

        const {lbg_transaction_info} = qsObj;

        console.log('\n ==============\n');

        // todo: (base64 & json)   Base64 :: JSONer
        const decoded__lbg_transaction_info__json = new Base64().resolve(lbg_transaction_info);
        const obj = JSON.parse(decoded__lbg_transaction_info__json);
        console.log('decoded__lbg_transaction_info__json', obj);
        console.log(Object.keys(obj).join(', '))
        /*
        {
            app-name,
            AuthenticationContext,
            IntentId,
            IntentVersion,
            Nonce, original-uri,
            redirect_uri, response_type,
            rstate,
            scope,
            state,
            Type,
            x-tpp-client-id,
            x-lbg-internal-user-role,
            x-lbg-sub-channel,
            Session-Id,
            ProviderName,
            x-lbg-ob-tpp-id,
            IsReauth,
            iss,
            aud,
            IntentType,
            OBIEVersion
        }
        */

       const next_url2 = company_config.transaction_context_endpoint;

        const gets_headers = {
            'x-lbg-transaction-info':  lbg_transaction_info,
            //"accept": accept_mimetype,
        };

        {
        // third GET style?
        const {statusCode,statusMessage,headers,response_buffer} = await call_get_style2(
            next_url2,
            // 'text/*',
            /*'content-type':*/ 'application/json',
            gets_headers
        );
        console.log('resp4', {statusCode,statusMessage,headers,response_buffer});
        console.log('BODY:::\n', response_buffer.toString());
        // success !
        const obj4 = JSON.parse(response_buffer.toString())
        console.log(obj4)
        console.log(obj4.lbg_transaction_info)

        // lbg_transaction_info is not the one above it. (Or maybe it is)
        // console.log(lbg_transaction_info)
        //  console.log('££££');

        const {
                TransactionContextResponse:
                {
                Scope,
                ChannelSelectionFlag,
                ProviderName,
                OriginalURI,
                'Session-Id':__SessionId,
                IsReauth,
                HasVisited,
                ConsentId,
                'OB-TPP-Id':__OB_TPP_Id,
                IntentType,
                IntentVersion,
                OBIEVersion },
            lbg_transaction_info
            } = obj4;

            // now what to do with these?
            {
            // 5
            const api_base = company_config.base_endpoint_path
            // previous one:  api_base + '/consent-preauth-validation-service/v1.0/transaction-context',

            // oh   lbg_transaction_info  might be the grand access_token

            const next_url5 = `${api_base}/access-mgmt-service/v1.2/authenticate`;
            const qs5 = 'realm=lyds&authIndexType=module&authIndexValue=LbgAuthenticationModule';
            const qo5 ={
                realm: 'lyds',
                authIndexType: 'module',
                authIndexValue: 'LbgAuthenticationModule',
            };
            const full_url5 = next_url5 + '?' + qs5;
            console.log({full_url5});

            /*
            const {statusCode,statusMessage,headers,response_buffer} = await call_get_style2(
                full_url5,
                null,
                {
                    'content-type': 'application/json',
                    lbg_transaction_info,
                }
            );
            console.log({statusCode,statusMessage,headers,response_buffer} )
            // oops: 'Method Not Allowed',
            // because it is GET. IT needs to be POST
            */

           const key = new from_file(SOURCES.KEYS.TLS.aisp1.matls_key_filename).generate(null).toString();
           const cert = new from_file(SOURCES.KEYS.TLS.aisp1.matls_cert_filename).generate(null).toString();
           const b5 = await style_5_call__POST_tinfo_matls({
                url: full_url5,
                body_obj: {
                    // use this instead of bearertype_token
                    lbg_transaction_info,
                },
                // but use no Authorization: not bearertype_token,
                key_cert_tuple: {key, cert},
            });

            // now a proper error
            console.log('proper error');
            console.log(b5)
            }

        }
        }
        }


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
