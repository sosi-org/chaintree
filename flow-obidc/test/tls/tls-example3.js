

https://stackoverflow.com/questions/19665863/how-do-i-use-a-self-signed-certificate-for-a-https-node-js-server

'use strict';

const {Base64} = requiret('base64.js');

// const pem_filename = ;
const key_cert = require(
  //'./mas-tls-sit01.js'
  '../../sensitive-data/SIT01-OBIE/cached-data/ma-tls-1.js',
);
console.log('key_cert', key_cert)

// "ma tls" - specific
const matls_specific = ({key, cert}) => ({
  maxCachedSessions: 0,
  secureProtocol: 'TLSv1_2_method',
  securityOptions: 'SSL_OP_NO_SSLv3',
  ciphers: 'ALL',
  key: key,
  cert: cert
});

const {key, cert} = key_cert;
const matls_options = matls_specific({key, cert});

/*
  ca: fs.readFileSync(`${path}CA.pem`);
  cert: fs.readFileSync(`${path}CERT.pem`);
  key: fs.readFileSync(`${path}KEY.pem`);
*/
var https = require('https');
  // , fs = require('fs')
  //, path = require('path')
  //, port = 443 // process.argv[2] || 8043
  //, hostname = // process.argv[3] || 'localhost.greenlock.domains'
//  ;

//  const ca = fs.readFileSync(pem_filename /*path.join(__dirname, 'client', 'my-private-root-ca.cert.pem')*/)

/*
    ca: fs.readFileSync(`${path}CA.pem`),
    cert: fs.readFileSync(`${path}CERT.pem`),
    key: fs.readFileSync(`${path}KEY.pem`),
*/

const example3_data = require('../../sensitive-data/SIT01-OBIE/test/direct.js').tls_example3_data;
console.log(example3_data);
process.exit(1);
var options = {
  host: example3_data.host,
  port: 443,
  path: example3_data.path,
  //ca: ca   // no ca
  ...matls_options,
};

console.log({options});

//  self signed certificate in certificate chain
//    meaning?


const tpp_app_id_secret = require('../company-config.js').tpp_app_id_secret;
//{clientId,clientSecret}  = tpp_app_id_secret;
const ClIdsecretObj = {id: tpp_app_id_secret.clientId, secret: tpp_app_id_secret.clientSecret}

const C_id_secret_64 = new Base64().generate(
  `${tpp_app_id_secret.clientId}:${tpp_app_id_secret.clientSecret}`
);
const body_data = "grant_type=client_credentials&scope=openid accounts";
const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
  "Authorization": `Basic ${C_id_secret_64}`,
};

const options2 = {...options, headers};

options.agent = new https.Agent(options2);
// Error: self signed certificate in certificate chain

https.request(options, function(res) {
  res.pipe(process.stdout);
}).end();
