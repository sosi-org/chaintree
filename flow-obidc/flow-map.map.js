/* Almost a DSL

The grand scheme of things. The grand map.

Creates the large-scale shape of the graph, i.e. a complete one. To check statically. (or run-time also possible).
    But it hides the details.
    Well, it turned out to have some details.
    An even higher would  be possible.

The grand scheme of things. The grand map.

The DSL:
Each line adds to stack (i.e. flow bundle)
Each call
Parentheses:
    1. to modularize
    2. For epi-flow branches

The epi-flow branches are ended by "Validate".
    consume "null"?
    Consume "true"!
    (i.e. close the loop)
*/
company_config.wellknown
fabrics.http_request()  // jsonated
(
  Schema_from_swagger(require_yaml('./wellknown.swagger.yaml'));
  // validation  // i.e. consumes, but with no output.
)

// token_endpoint, like filenames, is a reference/"refname"
jsonated.token_endpoint

require('./sensitive-data/SIT01-OBIE/cached-data/ma-tls-1.js')
({grant_type:"client_credentials", scope:"openid accounts"})
// /oidc-api/v1.1/token
fabrics.http_request()  //b
// gives you {..., access_token: gktvo...}

(
new Schema_from_swagger(require_yaml('./token1.schema.yaml'));
// validation
)
token1.access_token  // access_toekn

gktvo_resolver()
+require('./sensitive-data/SIT01-OBIE/cached-data/lu01-token.key????')
component_jws()

jws (...)



/*
  +   <--- just add. dont consume

  (...)   <--- subroutine. sends an output

  (...
  validate) <----- epi-ophenomental. Does not send output

  company_config.wellknown <---- consumes nothing but adds 'wellknown' part.
      // add means add to stack?
      // but it is not stack in the clasical sense.
      It adds to the bundle of the flows.

*/
