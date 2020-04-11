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

function process_data(input_jso) {
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

function slice_querystring(url) {
  // Exmaples:  "/?a=5&b=9" or "/"
  const cut_first_questionmark_re = /[^\?]+\?(.*)/;
  const m = cut_first_questionmark_re.exec(url);
  if (m) {
    return m[1];
  }
  return null;
}

function recode_jso(jso) {
    return JSON.parse(JSON.stringify(jso));
}

function process_querystring(request) {
    const { url } = request;
    const qs_str = slice_querystring(url);
    if (qs_str === null) {
        return null;
    }
    const qs_jso = qs.parse(qs_str);
    return recode_jso(qs_jso);
}

http.createServer(async function(req,res) {
    console.log(req.method + " --> " + JSON.stringify(req.headers));

    const { headers, method, url } = req;
    const bodystr_promised = processs_body(req);
    const query_jso = process_querystring(req);
    console.debug('query_jso ', query_jso );

    if(req.method === VERB_GET) {
        // console.debug('input received', req);
        // const ip = res.socket.remoteAddress;
        // const port = res.socket.remotePort;
        // .headers

        /* choose REST input */
        const input_jso = query_jso;
        // const input_jso = await bodystr_promised;

        let data_jso;
        if (input_jso === null) {
            // no data to process.
            data_jso = null;
            console.debug('no data to process');
        } else {
            data_jso = process_data( input_jso );
        }

        res.writeHead(OK200,
              { ...CORS_RESPONSE,
                'Content-Type'  : APPLICATION_JSON,
              }
        );
        res.write(JSON.stringify(data_jso));

    } else if(req.method === VERB_OPTIONS) {
        // Whre are the OPTIONS requests gone?
        res.writeHead(OK200, CORS_RESPONSE);
    } else {
        console.debug('    not processing: ', req.method);
    }
    res.end();
}).listen(PORT, function(){
    console.log("visit me at http://localhost:"+PORT);
});
