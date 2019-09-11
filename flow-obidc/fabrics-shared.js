'use strict';

const https = require('https')

const {allow_enum, allow_type, lazy_assert_check_equal, all_non_undefined, all_mustbe_undefined} = require('./error-checking.js');
const {TemplatorConstraintError, FlowValueConstraintError, StatusNon200} = require('./custom-errors/custom-exceptions.js');

/*
    from simple-http-experiment/oidc.flow.js
*/
function http_request({verb, hostname, path, port, headers, body_data, matls, extra_options}) {

    allow_enum(verb, ['POST', 'GET', 'PUT']);
    allow_type(hostname, 'string');
    allow_type(path, 'string');
    allow_type(port, 'integer');
    allow_type(headers, 'dict');

    console.log('url:', hostname + ':' + port + path);
    if (verb === 'GET') {
        all_mustbe_undefined ([body_data]);
        body_data = undefined;
    } else {
        console.log('body_data1', body_data);
        all_non_undefined([body_data]);
    }
    // to keep separate

    const from_extra_options = extra_options ? {
      rejectUnauthorized: extra_options.rejectUnauthorized,
    } : {};

    const from_matls = matls ? {
      maxCachedSessions: matls.maxCachedSessions,
      secureProtocol: matls.secureProtocol,
      securityOptions: matls.securityOptions,
      ciphers: matls.ciphers,
      key: matls.key,
      cert: matls.cert,
    } : {};

    const options = {
      hostname,
      port,
      path,
      method: verb,
      headers,
      ...from_extra_options,
      ...from_matls,
    };
    // console.log({options});

    return new Promise( (accept, reject) => {
        console.log('\n===========================================================================');
        console.log('Full request:', JSON.stringify(options),'\n');
        const req = https.request(options, (res) => {

          console.log(`statusCode: ${res.statusCode}`)
          if (res.statusCode !== 200) {
              // standard Exception
              throw new StatusNon200(res.statusCode);
          }
          res.on('data', (response_data_buffer) => {
            // single chunk only?
            const response_string = response_data_buffer.toString();
            console.log('\nFull response:', response_string,'\n');
            accept(response_string);
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

// old name: flow_valid_if()
function flow_valid_value(value, expected, constraint_description) {
    // lazy_assert_check;
    // (cond === true, true)
    // (cond, true)
    lazy_assert_check_equal(value, expected, FlowValueConstraintError, 'this flow will be valid only if constraint met: ' + constraint_description);
    // TemplatorConstraintError
}

/*
    "template-constraint" version of flow_valid_value (ass opposed to flow-constraint)
*/
function valid_value_as_template_constraint(value, expected, constraint_description) {
    lazy_assert_check_equal(value, expected, TemplatorConstraintError, 'this constraint failed: ' + constraint_description);
}

function flow_valid_type(value, expected_type, constraint_description) {
    allow_type(value, expected_type, 'this flow will be valid only if constraint met: ' + constraint_description);
    // FlowValueConstraintError
}

/*
  Non-specific (context-free) flow checks.
*/
const check_flow =
    (a) =>
        flow_valid_value(a !== undefined, true, 'undefined cannot flow in wires') &&
        true;

// call types/modes:
const callModes = {
    TLS_selfsigned: {extra_options: {rejectUnauthorized: false}},

    matls_keycert: // = ({key, cert}) => ({}),
        ({key, cert}) => ({matls: {
            maxCachedSessions: 0,
            secureProtocol: 'TLSv1_2_method',
            securityOptions: 'SSL_OP_NO_SSLv3',
            ciphers: 'ALL',
            key: key,
            cert: cert
        }}),
};

/*
//must have only one field
// extract_single_field()
// extract_the_only_field(jws_argObj, 'jws')
*/
function extract_the_only_field(obj, field_name) {
    // todo: move to proper fabrics. keep this file for http requests.
    lazy_assert_check_equal(Object.keys(obj).length, 1);
    allow_enum(Object.keys(obj)[0], [field_name]);
    return obj[field_name];
}
/*
    no: this is equivalent to check schema.
    extract_all_fields(obj, array_list_of_fields)
    extract_the_only_field(jws_argObj, ['jws'])
*/

module.exports = {
    http_request,
    flow_valid_value,
    flow_valid_type,
    check_flow,
    valid_value_as_template_constraint,
    callModes,
    extract_the_only_field,
};
