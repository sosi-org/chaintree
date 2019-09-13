'use strict';

const {callModes, http_request} = require('./fabrics-shared.js');
const {UrlRegExp, UrlRegExpWithPort} = require('./templator/url-re.js');
const {Base64} = require('./templator/base64.js');
const {all_non_undefined}  = require('./error-checking.js');
const {allow_fixed_special_only} = require('./error-checking.js');

function ignore_https_TLS_SSC_error() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

async function call_post_style_1(token_endpoint, {clientId,clientSecret}, body_data, key_cert_tuple) {

    //const ClIdsecretObj = {id: clientId, secret: clientSecret};
    //console.log('----',ClIdsecretObj);
    // template code: (generate/reconstruct)
    const ClIdsecret = `${clientId}:${clientSecret}`;
    // a simple transform (again reversible)
    const base64 = new Base64();
    const ClIdsecret64 = base64.generate(ClIdsecret);

    // then
    let {hostname, path, port, prot} = new UrlRegExpWithPort().resolve(token_endpoint);
    // console.log({hostname, path, port});
    all_non_undefined({hostname, path, port, prot});
    allow_fixed_special_only(prot, 'https');

    // console.log('ClIdsecret64', ClIdsecret64);

    //console.log('****11');
    //try{
    // using hostname, etc enforces use of the full format (typed URL like an OOP object)
    const opt = {
        verb: 'POST', hostname, path, port, headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${ClIdsecret64}`,
        },
        body_data: body_data,
        ...callModes.TLS_selfsigned,
        //...callModes.matls_keycert({key, cert}),
        ...callModes.matls_keycert(key_cert_tuple),
    };
    /* ??
        "rejectUnauthorized": false,
        "followRedirect": false
    */

    // console.log('****opt', opt);
    const {response_buffer: b} = await http_request( opt );
    // console.log('****222');
    return b.toString('utf-8');
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

  all_non_undefined({hostname, path, port, prot});

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
      ...callModes.TLS_selfsigned,
      ...callModes.matls_keycert(key_cert_tuple),
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
  const {response_buffer: b} = await http_request( opt );
  return b.toString('utf-8');
}

/**
  simple GET call
  -  no query string
  -  no #
  -  returns json
 */
async function call_get_style1(get_url) {
    let {hostname, path, port, prot} = UrlRegExp().resolve(get_url);

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

    // ignore_https_TLS_SSC_error();


    const {response_buffer: a} = await http_request(
        {verb: 'GET', hostname, path, port, headers,
        /*, body_data: 'hello'*/ /*body_data: undefined, */
        ...callModes.TLS_selfsigned,
    });

    return a.toString('utf-8');
}
/*
    GET
    - has query string
    - no #
    - returns html
*/
async function call_get_style2(get_url /*, query_string*/, accept_mimetype) {
    let {hostname, path, port, prot} = new UrlRegExpWithPort().resolve(get_url);

    all_non_undefined({hostname, path, port, prot});

    const headers = {
        "cache-control": 'no-cache',
        "accept": accept_mimetype,
    };

    const {response_buffer: a} = await http_request(
        {verb: 'GET', hostname, path, port, headers,
        ...callModes.TLS_selfsigned,
    });

    return a.toString('utf-8');
}


module.exports = {
  call_post_style_1,
  style_3_call__POST_bearer_matls,
  call_get_style1,
  call_get_style2,
}