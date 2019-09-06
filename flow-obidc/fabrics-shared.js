'use strict';

const https = require('https')

const {allow_enum, allow_type, lazy_assert_check_equal} = require('./error-checking.js');
const {TemplatorConstraintError, FlowValueConstraintError} = require('./custom-errors/custom-exceptions.js');

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
          if (res.statusCode !== 200) {
              // standard Exception
              throw new Error('Status other than 200: ' + res.statusCode);
          }
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


module.exports = {
    http_request,
    flow_valid_value,
    flow_valid_type,
    check_flow,
    valid_value_as_template_constraint,
};
