'use strict';

const company_config = require('./company-config.json');

console.log(company_config);

const fabrics = require('./fabrics-shared.js');

console.log(company_config.wellknown);


const {UrlRegExp} = require('./templator/url-re.js');



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
};

function ignore_https_TLS_SSC_error() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

async function doit() {
    try {
        // ignore_https_TLS_SSC_error();
        const a = await fabrics.http_request(
            {verb: 'GET', hostname, path, port, headers,
            /*, body_data: 'hello'*/ /*body_data: undefined, */
            extra_options: {rejectUnauthorized: false}
        });
        console.log("outcome:", a);

    } catch (e) {   
        console.error(e);
    }
}

doit();
