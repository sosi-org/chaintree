// const b = require('openapi3-ts');
/*
/src/model TS typed interfaces for helping building a contract.
See:
/src/dsl Fluent DSL for building a contract.

*/

import { OpenApiBuilder } from "openapi3-ts";
OpenApiBuilder.create().addTitle("t1").rootDoc;
       let path1 = {
            get: {
                responses: {
                    default: {
                        description: "object created"
                    }
                }
            }
        };
const sch = OpenApiBuilder.create().addPath("/path1", path1);
// addResponse("resp00", resp00).rootDoc
// addParameter("par5", par5).rootDoc;
// addHeader("h5", h5).rootDoc;
// addCallback("cb1", cb1)


console.log(sch);
console.log(sch.rootDoc);
console.log('-');
