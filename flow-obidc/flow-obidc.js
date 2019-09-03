'use strict';

const company_config = require('./company-config.js');

console.log(company_config);

const fabrics = require('./fabrics-shared.js');

console.log(company_config.wellknown);


const {UrlRegExp, UrlRegExpWithPort} = require('./templator/url-re.js');

const {Schema_from_swagger, require_yaml} = require('./templator/swagger2-schema.js');


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


function encode64(strData) {
    return Buffer.from(strData).toString('base64');
  }

async function doit() {
    try {
        // ignore_https_TLS_SSC_error();

        // call types/modes:
        const callModes = {TLS_selfsigned: {extra_options: {rejectUnauthorized: false}}};

        const a = await fabrics.http_request(
            {verb: 'GET', hostname, path, port, headers,
            /*, body_data: 'hello'*/ /*body_data: undefined, */
            ...callModes.TLS_selfsigned,
        });
        const jsonated = JSON.parse(a);
        console.log("outcome:", a);

        const checker = new Schema_from_swagger(require_yaml('./wellknown.swagger.yaml'));
        //checker.resolve(a);
        checker.resolve(jsonated); // throws if wrong

        const token_endpoint = jsonated.token_endpoint;
        console.log("token_endpoint:", token_endpoint); 

        console.log('part 2');
        const part2 = async () =>{
            // then: prapare:
            // const: (source)
            const ClIdsecretObj = {id: '6bc0daf9-c856-4b39-9e51-c52de7726460', secret: 'S1hL1rR0tA4sD6uA3nB2rX3rY5gA8gL5fC4aR0yF8nB7vQ5pB8'};
            // template code: (generate/reconstruct)
            const ClIdsecret = `${ClIdsecretObj.id}:${ClIdsecretObj.secret}`;
            // a simple transform (again reversible)
            const ClIdsecret64 = encode64(ClIdsecret);

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
            console.log('part 2: output:', b);
            const bobj = JSON.parse(b);
            const checker = new Schema_from_swagger(require_yaml('./token1.schema.yaml'));
            checker.resolve(bobj); // throws if wrong
            return bobj;
        };
        part2();

    } catch (e) {   
        console.error(e);
    }
}

doit();
