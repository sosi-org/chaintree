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
    'User-Agent': 'PostmanRuntime/7.15.2',
    'Accept': '*/*',
    'Cache-Controle': 'no-cache',

    'Host': 'gatewaydata02.psd2.sandbox.extranet.group',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
};



async function doit() {
    try {
        await fabrics.http_request({verb: 'GET', hostname, path, port, headers /*, body_data: 'hello'*/ });
    } catch (e) {   
        console.error(e);
    }
}

doit();
