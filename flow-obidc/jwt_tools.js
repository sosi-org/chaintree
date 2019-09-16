
'use strict';

const {RegExpResolver} = require('./templator/url-re.js');
const {Base64} = require('./templator/base64.js');
const {from_file} = require('./templator/from_file.js');
const fabrics = require('./fabrics-shared.js');

const {extract_the_only_field} = require('./fabrics-shared.js');



const part4_verify_jws_signature = (jws_string, SOURCES) => {
  // Use RFC7515 to decode JWS


  /*
      inputs:
          args = (provides the resolved jws).
      SOURCES: (filenames as references. Are reference to "labelled-lines". The (flow/circuit of the) content of files need to be determined later.)
          key file (provides SSA)

      orphan outputs: kid
  */

  /*
  // b64url_buffer
  const {b64url_buffer} = require('./templator/b64url.js');
  //base64url_decode_to_binary = new b64url_buffer().resoslve
  const b64ubobj = new b64url_buffer();

  // a;; variables must be const. (subclass of javascript)
  const {header, payload, signature} = args;
  const base64 = new Base64();
  const decod64ed_jws = {
      header: base64.resolve(header),
      payload: base64.resolve(payload),
      // signature: base64url_decode_to_binary(signature),
      signature: b64ubobj.resolve(signature),
  };
  */
 const decod64ed_jws = jws_tripartite_template_(jws_string);
  // semantics are the same. (Semantics signature).
  //      same type of same name? (args)
  //      This is extra on top of types being the same. 
  // (none of them implies the other).
  // But only being "piped" directly (no branch) + same name means so (not same type))
  console.log('decod64ed_jws', decod64ed_jws);

  // ssa source (input) required (from the upper circuits/circle)
  // const ssa = '??';
  //const pem = require_pem('./sensitive-data/r1_private_key.key');
  // const priv_key_source = new require_pem('./sensitive-data/r1_private_key.key');
  const priv_key_source = new from_file(SOURCES.key_filename);
  const binary_private_key = priv_key_source.generate(null);
  const ssa = binary_private_key; // changin name for semanticss
  console.log('PRIVATE KEY: ', ssa /*, ssa.toString()*/);

  const {sign_verifier_u3} = require('./templator/signer.js')
  // wiring instruction. (w-time!)
  console.log('decod64ed_jws', decod64ed_jws);
  /*
  const decod64ed_jws_header_obj = JSON.parse(decod64ed_jws.header)
  console.log('decod64ed_jws_header_obj', decod64ed_jws_header_obj);
  */
  // partial wiring (resolution) not allowed.
  // combined operations (lookup + parse) not allowed in one statement.

  //const algorithm = decod64ed_jws_header_obj.alg;
  /*
      instead of:
          const algorithm = decod64ed_jws_header_obj.alg;  // some wiring here. Needs to be made explicit and separated.
      it must be:
          const {algorithm, kid} = JSON.parse(decod64ed_jws.header);
  */
  // nice: enforces the limitation of direct renaming only.
  const {alg:algorithm, kid} = JSON.parse(decod64ed_jws.header);
  // console.log({algorithm, kid} );

  fabrics.check_flow(algorithm); // checks it is not undefined.
  // note: is RS256. Uses RSASSA: . The following ussage requires this.
  const sr = new sign_verifier_u3({
      algorithm, // never use non-(Shorthand property names)
      key: ssa,  // can rename
  });

  // this flow will be valid only if RSA-SSA is used:
  fabrics.flow_valid_value(sr.type(), 'rsa-ssa', 'RSA-SSA must be used');

  // explicit_type( decod64ed_jws,  {payload: 'string', algorithm: 'string', header: 'string'} )
  // explicit_type(decod64ed_jws.payload, 'string');
  fabrics.flow_valid_type(decod64ed_jws.payload, 'string', 'payload is a string');

  //console.log("decod64ed_jws.payload", decod64ed_jws.payload);
  /*
  const header_payload_tuple = new RegExpResolver(
        /^([^\.]*)\.([^\.]*)$/gm,
        {1:'header', 2: 'payload'},
        ({header, payload}) => `${header}.${payload}`
  );
  */
 const signee_signature_tuple = new RegExpResolver(
    /^([^\.]*\.[^\.]*)\.([^\.]*)$/gm,
    {1:'signee', 2: 'signature'},
    ({signee, signature}) => `${signee}.${signature}`
 );

 /*
  // this is the non-reversible part:
  const partial_info = {header: args.header, payload: args.payload};
  // how to make this "partial_info" reversible?

  const _signee = header_payload_tuple.generate(partial_info);
  const _signature = args.signature;
  */
  const {signee:_signee, signature:_signature} = signee_signature_tuple.resolve(jws_string);
  console.log( signee_signature_tuple.resolve(jws_string) )

  // const q4 = sr.resolve({data: decod64ed_jws.payload, signature: decod64ed_jws.signature});
  const reproduced = sr.resolve({data: _signee, signature: _signature});

  console.log('4444444 reproduced', reproduced);
  return reproduced;
};

function jws_tripartite_template64() {
    const jws_template = new RegExpResolver(
        /^([^\.]*)\.([^\.]*)\.([^\.]*)$/gm,
        //   /^(?<header>[^\.]*)\.(?<payload>[^\.]*)\.(?<signature>[^\.]*)$/
        {1:'header', 2: 'payload', 3: 'signature'},
        ({header, payload, signature}) => `${header}.${payload}.${signature}`
    );
    return jws_template;
}
const {b64url_buffer} = require('./templator/b64url.js');

// also decides the encoded64
// signature will be binary, but `header` and `payload` will be strings
function jws_tripartite_template_(jws_string) {

    const jws_template = jws_tripartite_template64();
    const args = jws_template.resolve(jws_string);

    //base64url_decode_to_binary = new b64url_buffer().resoslve
    const b64ubobj = new b64url_buffer();
    const base64 = new Base64();

    // a;; variables must be const. (subclass of javascript)
    const {header, payload, signature} = args;
    const decod64ed_jws = {
        header: base64.resolve(header),
        payload: base64.resolve(payload),
        // signature: base64url_decode_to_binary(signature),
        signature: b64ubobj.resolve(signature),
    };
    return decod64ed_jws;
}
// compo nent_jws
// only verifies
function component_jws_verifysignature(jws_string, SOURCES) {

    /*
  const jws_template = jws_tripartite_template64();
  const args = jws_template.resolve(jws_string);
  //console.log(args);
  */

  const jws = part4_verify_jws_signature(jws_string, SOURCES);
  /*
  now I have a `jws`
      the proper format should be:
          writing the output vasriable "after" the funciton call.
          For example:
              part4_verify_jws_signature() >> jws;  // jws is undefined. It is defined here
              part4_verify_jws_signature() >> jws;  // jws is undefined. It is defined here
              const part4_verify_jws_signature() >> ?jws;  // The question mark marks it as the new variable (applied the "const" to it. The scope will be determined by the locaiton of the const on the left hand side.).
  */
 return jws;
}

/*
    extracts gktvo from the concatenation.
*/
function accesstoken_from_gktvo(access_toekn_gktvo) {
    // Produce a 'gktvo' Bearer
    const jws_gktv = new RegExpResolver(
            /^gktvo(.*)$/gm,
            //todo: auto generate this by naming groups:
            // NamedRegExpResolver
            //      /^gktv(?<jws>.*)$/gm,
            {1:'jws'},
            ({jws}) => `gktvo${jws}`
        );
    const jws_argObj = jws_gktv.resolve(access_toekn_gktvo);
    console.log('***jws_argObj', jws_argObj);

    // access_token__jws_string is the access_token

    //SSA = ...
    // simple flow binding (single-arg)
    // const access_token__jws_string = jws_argObj.jws;
    const access_token__jws_string = extract_the_only_field(jws_argObj, 'jws');
    return access_token__jws_string;
}

module.exports = {
    component_jws_verifysignature,
    accesstoken_from_gktvo,
    jws_tripartite_template_,
}
