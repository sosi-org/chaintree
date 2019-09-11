'use strict';

const {callModes, http_request} = require('./fabrics-shared.js');
const {UrlRegExpWithPort} = require('./templator/url-re.js');
const {Base64} = require('./templator/base64.js');

async function call_post_style_1(token_endpoint, {clientId,clientSecret}, body_data, key_cert_tuple) {

    //const ClIdsecretObj = {id: clientId, secret: clientSecret};
    //console.log('----',ClIdsecretObj);
    // template code: (generate/reconstruct)
    const ClIdsecret = `${clientId}:${clientSecret}`;
    // a simple transform (again reversible)
    const base64 = new Base64();
    const ClIdsecret64 = base64.generate(ClIdsecret);

    // then
    let {hostname, path, port} = new UrlRegExpWithPort().resolve(token_endpoint);
    // console.log({hostname, path, port});

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
    const b = await http_request( opt );
    // console.log('****222');
    return b;
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
  const b = await http_request( opt );
}

module.exports = {
  call_post_style_1,
  style_3_call__POST_bearer_matls,
}