'use strict';

const https = require('https')

const {allow_enum, allow_type} = require('./error-checking.js');

/*
    from simple-http-experiment/oidc.flow.js
*/
function http_request({verb, hostname, path, port, headers, body_data, extra_options}) {

    allow_enum(verb, ['POST', 'GET', 'PUT']);
    allow_type(hostname, 'string');
    allow_type(path, 'string');
    allow_type(port, 'integer');
    allow_type(headers, 'dict');

    // to keep separate
    const from_extra_options = extra_options?{
      rejectUnauthorized: extra_options.rejectUnauthorized
    }:{};

    const options = {
      hostname,
      port,
      path,
      method: verb,
      headers,
      ...from_extra_options,
    };

    return new Promise( (accept, reject) => {
        console.log('request:', JSON.stringify(options));
        const req = https.request(options, (res) => {

          console.log(`statusCode: ${res.statusCode}`)

          res.on('data', (response_data_buffer) => {
            // single chunk only?
            accept(response_data_buffer.toString());
          });
        });

        req.on('error', (error) => {
          reject(error);
        })

        if (typeof body_data !== 'undefined') {
            req.write(body_data);
        }
        req.end();
    });
};


module.exports = {
    http_request,
};
