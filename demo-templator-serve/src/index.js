'use strict';

const http = require('http');

// Depencency
const transform = require('./serve-json-templator.js');

/* */
const PORT = 8080;
const OK200 = 200;

const VERB_OPTIONS = 'OPTIONS';
const VERB_GET = 'GET';

const APPLICATION_JSON = 'application/json';

const CORS_ALLOWED_ORIGINS = 'https://sohale.github.io';
// '*';
// 'http://localhost:3333'
// 'https://sohale.github.io'
const CORS_ALLOWED_HEADERS = ['Content-Type', 'MyCustomHeader'];

function process_data(req) {
    console.debug('input received', req);
    // const ip = res.socket.remoteAddress;
    // const port = res.socket.remotePort;

    // .headers

    const input_jso = {};
    const output_jso = transform(input_jso);
    return output_jso;
}

/* */
const CORS_RESPONSE = {
  'Access-Control-Allow-Methods'     : VERB_GET,
  'Access-Control-Allow-Origin'      : CORS_ALLOWED_ORIGINS,
  'Access-Control-Allow-Headers'     : CORS_ALLOWED_HEADERS.join(', '),
};

//async
const processs_body = /*async*/ (request) => new Promise((resolve, reject) => {
  const body = [];
  request.on('error', (err) => {
      reject(err);

  }).on('data', (chunk) => {
      body.push(chunk);
  }).on('end', () => {
      const bodystr = Buffer.concat(body).toString();
      resolve(bodystr);
  });
});

const qs = require('querystring');

function process_querystring(request) {
    const { url } = request;
    console.debug('req.url = ' + url );
    return url;
}

http.createServer(async function(req,res) {
    console.log(req.method + " --> " + JSON.stringify(req.headers));

    const { headers, method, url } = req;
    const bodystr_promised = processs_body(req);
    console.debug('bodystr_promised', bodystr_promised);
    //const bodystr = await processs_body(req);
    //const bodystr = processs_body(req).resolve();
    const query_jso = process_querystring(req);

    if(req.method === VERB_GET) {
        const data_jso = process_data(await bodystr_promised );
        res.writeHead(OK200,
              { ...CORS_RESPONSE,
                'Content-Type'  : APPLICATION_JSON,
              }
        );
        res.write(JSON.stringify(data_jso));

    } else if(req.method === VERB_OPTIONS) {
        res.writeHead(OK200, CORS_RESPONSE);
    }
    res.end();
}).listen(PORT, function(){
    console.log("visit me at http://localhost:"+PORT);
});
