'use strict';

/*
    Validate the output json against the swagger sepcifications.

    Use the "schema" part of the swagger file (as yaml or json)

    Uses Swagger 2.0 format.
    Not very good: The default mode for fields is not mandatory.
    see: https://swagger.io/docs/specification/2-0/basic-structure/
*/

const tv4 = require('tv4');
tv4.language('en-gb');

var require_yaml = require('require-yml');

/*
    swagger_pointname: the endpoint of swagger (for specifying the schema within the swagger2 file)
    Uses Swagger v2

    swagger_pointname example: '/business-current-accounts',
*/
function getSwaggerV2Schema(swagger_filecontent, swagger_pointname) {

    let swaggerjson = swagger_filecontent;
    // validate_data_static(swagger_pointname, ()=>'swagger_pointname missing: '+swagger_pointname);
    // let schema = lookupPathInJson(swaggerjson, ['paths', swagger_pointname, 'get', 'responses', '200', 'schema']);
    // let schema = swaggerjson.paths[swagger_pointname].get.responses['200'].schema;
    let schema = swaggerjson.paths[swagger_pointname].get.responses['200'].content['application/json'].schema;
    return schema;
}

function schemaValidator(schema, json_data) {
    console.log();
    console.log('----------');
    console.log('matching: ', schema);
    console.log('with: ', json_data);
    let validation_result = tv4.validateMultiple(json_data, schema);
    console.log(validation_result)

    const errors = validation_result['errors'];

    console.log('----------');
    console.log();

    // for troubleshooting, use another method
    return errors.length === 0;
}
/*
    old interface:
        Schema_from_swagger_yaml(require('./wellknown.swagger.yaml'));
        Schema_from_swagger_yaml(yaml_file_content)
*/
function Schema_from_swagger(schema_content) {
    'use strict';
    // use new

    this.resolve = (input_json_obj) => {
        //const schema = getSwaggerV2Schema(schema_content, '/default_endpoint')
        const schema = schema_content;
        const ok = schemaValidator(schema, input_json_obj);
        if (ok) {
            return input_json_obj;
        } else {
            throw new Error('mismatch: The constraint aspect of template failed');
        }
    };

    this.generate = (obj) => this.resolve(obj);
}

// example: require_yaml


module.exports = {
   require_yaml,
   Schema_from_swagger,
};

