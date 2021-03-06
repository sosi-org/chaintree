'use strict';

/*
    alternative 1:
        constructor(algorithm).resolve(data, signature)

    alternative 2:
        constructor().resolve(data, signature, algorithm)

    resolve():
      verifies
    genmerate():
      verifies
    // algorithm can never be a "completion" output.

    Four entities:
        data
        algorithm
        signature
        secret

    Basic operations:
        (secret, data, algorithm)  ->  (signature)
        (signature, data, algorithm)  ->  (bool)
*/

/*
  Terminology:
    MAC = message authentication code (MAC)
    HMAC = keyed-hash MAC
    HMAC = hash-based MAC
*/

const jwa = require('jwa');
/*
  Also see "safe-buffer"
  node-jws, jwa
*/

const technical_debt = require('../dev/technical-debt.js');

const ALG_BOOK = {

    /* algorithm : [cryptosystem, description, hash_bits, signature_length_bits, "length of the order of the base point"], */

    HS256:	['hmac', 'HMAC using SHA-256 hash algorithm', 256, -1,-1],
    HS384:	['hmac', 'HMAC using SHA-384 hash algorithm', 384, -1,-1],
    HS512:	['hmac', 'HMAC using SHA-512 hash algorithm', 512, -1,-1],
    RS256:	['rsa-ssa', 'RSASSA using SHA-256 hash algorithm', 256, -1,-1],
    RS384:	['rsa-ssa', 'RSASSA using SHA-384 hash algorithm', 384, -1,-1],
    RS512:	['rsa-ssa', 'RSASSA using SHA-512 hash algorithm', 512, -1,-1],
    PS256:	['rsa-ssa', 'RSASSA-PSS using SHA-256 hash algorithm', 256, -1,-1],
    PS384:	['rsa-ssa', 'RSASSA-PSS using SHA-384 hash algorithm', 384, -1,-1],
    PS512:	['rsa-ssa', 'RSASSA-PSS using SHA-512 hash algorithm', 512, -1,-1],
    ES256:	['ecdsa', 'ECDSA using P-256 curve and SHA-256 hash algorithm', 256, -2,-1],
    ES384:	['ecdsa', 'ECDSA using P-384 curve and SHA-384 hash algorithm', 384, -2,-1],
    ES512:	['ecdsa', 'ECDSA using P-521 curve and SHA-512 hash algorithm', 512, 1042, 521],
    // none	No digital signature or MAC value included;
};

const {register_templator} = require('../templatore-store.js');

/*
    base operations: (primitives, atomics)
*/
// hmac usage primitives. (HS256, HS384, HS512)
function hmac_sign(hmac_alg_obj, data, secret) {
    // secret = secret cryptographic key.
    // alg_obj = cryptographic hash function
    const signature = hmac_alg_obj.sign(data, secret);
    return signature;
}

function hmac_verify(hmac_alg_obj, data, signature, secret /*?!*/ ) {
    //const signature = hmac_alg_obj.sign(data, secret);
    return hmac_alg_obj.verify(data, signature, secret);
}

// ecdsa usage primitives. (ES256, ES384, ES512)
function ecdsa_sign(ecdsa_alg_obj, data, privateKey) {
    const signature = ecdsa_alg_obj.sign(data, privateKey);
    return signature;
}
function ecdsa_verify(ecdsa_alg_obj, data, signature, publicKey) {
    return ecdsa_alg_obj.verify(data, signature, publicKey);
}


// dataflow primitives
function g_sign({data},  /*param*/ {algorithm, key}) {
    // key = "private_key" (if "hmac") : "secret" (if "ecdsa")
    // only on owner's side.
    const alg_obj = jwa(algorithm);
    const signature = alg_obj.sign(data, key);
    return signature;
}

function g_verify({data, signature}, /*param*/ {algorithm, key}) {
    // console.log('checking signature:', {data, signature}, '  with', {algorithm, key})
    // Error: error:0909006C:PEM routines:get_name:no start line

    const data_buffer = Buffer.from(data);
    // key = "PUBLIC_key" (if "hmac") : "secret" (if "ecdsa")
    // only on consumer (client)'s side.
    const alg_obj = jwa(algorithm);
    // can break:
    // console.log({data:data_buffer, signature, key});
    console.log('Strings:', {data:data_buffer.toString(), signature:signature.toString(), key:key.toString()});
    // { data: 271, signature: 256, key: 1192 }
    console.log('lengths:', {data:data_buffer.length, signature:signature.length, key:key.length});
    // process.exit(1);
    try {

        const ver = alg_obj.verify(data_buffer, signature, key);
        console.log('verification:', ver); // false
        return ver;

    } catch (e) {
        // definitely not a constraint error. A rune-time binding (of course, to file) error.
        throw new Error('Constraint error: PEM file content format has problems:  ---- ' +e);
    }
}


class sign_verifier_u3 {
    /**
     *  On owner side:
     *    key = "PRIVATE_key" (if "hmac") : "secret" (if "ecdsa")
     *  On consumer side:
     *    key = "PUBLIC_key" (if "hmac") : "secret" (if "ecdsa")
     *
     *  Not correct. Above info is about the algorithm, not about the "side".
     *
     *  Constructor args:
     *     We don't want to reconstruct this information.
     *     Not even on owner's side.
     *
     *  key: secretOrPrivateKey
     */
    constructor({algorithm, key}) {
        /*
        this.algorithm = algorithm;
        this.key = key;
        */
        // It is all about tuples
        this.algorithm_key_tuple = {algorithm, key};
        /* {algorithm:this.algorithm, key: this.key} */
        this.type();    // for its error-checking (predicted side-effect)
    }

    type() {
        // cryptosystem type?
        const tuple = ALG_BOOK[this.algorithm_key_tuple.algorithm];
        const [code, description, hash_bits, signature_length_bits, basepoint_bits] = tuple;
        return code;
    }

    resolve({data, signature}) {
        // check input value. for example if string ...
        console.log({data: data.toString(), signature: signature.toString()});
        const verified = g_verify({data, signature}, this.algorithm_key_tuple);
        if (!verified) {
            // workaround: fake verification
            if (technical_debt.fake_jws_verification) {
                return data;
            }
            // finally a PEM file is processed. However, the SSA is not valid
            throw new Error('ConstraintFailed: verified='+verified);
        }
        // Can we reconstruct inputs from this (data only)? No.
        // But on the other hand, this is now "resolve/generate"-symmetric.
        return data;
    }
    generate(data) {
        const signature = g_sign({data}, this.algorithm_key_tuple);
        // return signature; // In what case?
        return {data, signature};
      }
}

// register_templator(sign_verifier_u3, ['data', 'signature'], ['data']);

require('../templatore-store.js').register_templator(
    sign_verifier_u3, ['data', 'signature'], ['data']
);

/*
class sign_verifier_u4 {
    //    We don't want to reconstruct this information (constructor args).
    //    Not even on owner's side.
    constructor({algorithm, key}) {
        this.algorithm_key_tuple = {algorithm, key};
    }
    resolve({data, signature}) {
        const verified = g_verify({data, signature}, this.algorithm_key_tuple);
        if (!verified) {
            throw new Error('Constraint failed');
        }
        // todo: make efficient by passing the original args
        return {data, signature}; // can we reconstruct inputs from this? yes.
    }
    generate(data) {
        const signature = g_sign({data}, this.algorithm_key_tuple);
        return {data, signature};
    }
}
// Incorrect
register_templator(sign_verifier_u4, ['data', 'signature'], ['data', 'signature']);
*/

/*
class sign_verifier_u1 {
    // resolve(data, signature, algorithm)   // u1
    // generate(data, algorithm)   // u1
}

class sign_verifier_u2() {
  constructor(algorithm) {
    this.hmac = jwa(algorithm);
  }
  resolve(data, signature) {
      this.hmac.verify(data, signature, secret);
      return data;
  }
  generate({data, secret}) {
      const signature = this.hmac.sign(data, secret);
      return signature;
  }
}
*/

module.exports = {
  // // sign_verifier_u1,
  // sign_verifier_u2,

  sign_verifier_u3,
  //sign_verifier_u4,
};
