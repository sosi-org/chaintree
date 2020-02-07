'use strict';
/*
  Not used:
+    "jsonwebtoken": "^8.5.1",
+    "njwt": "^1.0.0",
+    "secure-random": "^1.1.2",
+    "uuid": "^3.3.3"
*/

const {requiret, fabrics, error_checking} = require(__dirname + '/../templators/requiret.js');


const {from_file} = requiret('from_file');
const {Base64} = requiret('base64');
const {RegExpResolver} = requiret('url-re');

const {b64url_buffer} = requiret('b64url');
const {sign_verifier_u3} = requiret('signer')


// filenames (file-ref s)
/*
const SOURCES = {
  // require
  access_token_gktvo: '../sensitive-data/cached-data/red1-1-jws',
  //fs.read
  priv_key_source: './sensitive-data/r1_private_key.key',
};
const access_token_gktvo = //token1.access_token;
   require(SOURCES.access_token_gktvo);
*/


const SOURCES = {
  access_token_gktvo: './jws/2_jws_example.jws',
  // how to sepcify in compile-time that the following is a filename, hence, follow it when you click on it.
  priv_key_source: './jws/2_public.key',
    /* works on any of the following:
        './jws/2_public.key',
        './jws/2_private.key',
        './jws/2_private.pem',
    */
};

/*
function component(refs, inputs);
  refs: SOURCES: filenames, etc. Contant, but need ot be resolved (using access to atouside the box). These are ports.
  inputs: the set of flow data.
*/

const access_token_gktvo =
  'gktvo' +
  new from_file(SOURCES.access_token_gktvo)
  .generate(null)
  .toString();
// Next question: how to validate using private key?

console.log('access_token_gktvo:', access_token_gktvo);

const jws_gktv = new RegExpResolver(
        /^gktvo(.*)$/gm,
        //todo: auto generate this by naming groups:
        // NamedRegExpResolver
        //      /^gktv(?<jws>.*)$/gm,
        {1:'jws'},
        ({jws}) => `gktvo${jws}`
    );
const jws_str = jws_gktv.resolve(access_token_gktvo);
console.log('***jws_strjws_str', jws_str);

const jws_template = new RegExpResolver(
    /^([^\.]*)\.([^\.]*)\.([^\.]*)$/gm,
    //   /^(?<header>[^\.]*)\.(?<payload>[^\.]*)\.(?<signature>[^\.]*)$/
    {1:'header', 2: 'payload', 3: 'signature'},
    ({header, payload, signature}) => `${header}.${payload}.${signature}`
);
const args = jws_template.resolve(jws_str.jws);

//from part4()

// Use RFC7515 to decode JWS

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
// semantics are the same. (Semantics signature).
//      same type of same name? (args)
//      This is extra on top of types being the same. 
// (none of them implies the other).
// But only being "piped" directly (no branch) + same name means so (not same type))
//console.log('decod64ed_jws', decod64ed_jws);

// ssa source (input) required (from the upper circuits/circle)
// const ssa = '??';

// attach(file, 'pem-file-decoder')

//const require_pem = (filename) => {}



//const pem = require_pem('./sensitive-data/r1_private_key.key');
// const priv_key_source = new require_pem('./sensitive-data/r1_private_key.key');
const priv_key_source = new from_file(SOURCES.priv_key_source);
const binary_private_key = priv_key_source.generate(null);
let ssa = binary_private_key; // changin name for semanticss
console.log('PRIVATE KEY: ', ssa /*, ssa.toString()*/);
console.log('P----- KEY: ', ssa.toString());

// ssa = Buffer.from(ssa.toString()+'');
// sign_verifier_u3:
// wiring instruction. (w-time!)
// console.log('decod64ed_jws', decod64ed_jws);

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

const header_payload_tuple = new RegExpResolver(
  /^([^\.]*)\.([^\.]*)$/gm,
  {1:'header', 2: 'payload'},
  ({header, payload}) => `${header}.${payload}`
);
// this is the non-reversible part:
const partial_info = {header: args.header, payload: args.payload};
// how ot make it reversible?



console.log("decod64ed_jws.payload", decod64ed_jws.payload);
// const signee = decod64ed_jws.payload;  // incorrect
// const signee = args.payload /*decod64ed_jws.payload*/;
const _signee = header_payload_tuple.generate(partial_info);;

/*
    potential example found for propagation:
    A = (header.payload.signature) >> B = (header, payload)
    A = (header.payload.signature) >> C = (header,payload, signature)
*/
// const _signature = decod64ed_jws.signature;
const _signature = args.signature;
const q4 = sr.resolve({data: _signee, signature: _signature});
console.log('4444444 q4', q4);
return q4;
