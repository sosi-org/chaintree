'use strict';

var http = require('http');

/* */
var PORT = 8080;
var OK200 = 200;

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
    // .headers
    return {'ok': 'ok2'};
}

/* */
const CORS_RESPONSE = {
  'Access-Control-Allow-Methods'     : VERB_GET,
  'Access-Control-Allow-Origin'      : CORS_ALLOWED_ORIGINS,
  'Access-Control-Allow-Headers'     : CORS_ALLOWED_HEADERS.join(', '),
};

http.createServer(function(req,res){
    console.log(req.method + " --> " + JSON.stringify(req.headers));
    if(req.method === VERB_GET) {
        const data = process_data(req);
        res.writeHead(OK200,
              { ...CORS_RESPONSE,
                'Content-Type'  : APPLICATION_JSON,
              }
        );
        res.write(JSON.stringify(data));

    } else if(req.method === VERB_OPTIONS) {
        res.writeHead(OK200, CORS_RESPONSE);
    }
    res.end();
}).listen(PORT, function(){
    console.log("visit me at http://localhost:"+PORT);
});
