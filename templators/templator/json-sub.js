'use strict';

const { assert } = require('chai');


class JsonSub {

  // keywords: interpolate
  // parse-es6-template.js
  // extend to general interpolator 

  /* todo: optional arg: where to extract it*/
  constructor(jsonPattern) {
    const {enrichedJson, fields} = parseTemplate(jsonPattern);
    console.log('enrichedJson', enrichedJson);
    this.archetypeObj = JSON.parse(enrichedJson);
    this.archetypeJson = enrichedJson;

    this.fields = fields;
    this.revFields = mapObjObj(fields, (k, v) => {
      // k = paramName
      // v = unique-id-code
      return [v, k];
    });

    this.paths = mapObjObj(fields, /*(v,k)*/ (k, v) => {
      // v = unique-id-code
      // k = paramName
      const path = "(find v in archetypeObj)";
        // todo: check the names are unique: it isfound nowhere else

      return [k, path];
    });

    console.log({enrichedJson, fields, });
    /*
      {
        enrichedJson:
            '{"profile":{"name": "054b0c51-d8aa-76e9-0a14-284ff5cbbc03" },"birthday":{"year":"507747b9-8472-bef3-5aae-0c54af175339"},"data":{"jack":"surename"}}',
        fields:
        { name: '054b0c51-d8aa-76e9-0a14-284ff5cbbc03',
          year: '507747b9-8472-bef3-5aae-0c54af175339'
        }
      }
    */

    console.log( this.archetypeObj );
    /* {
      profile: { name: '054b0c51-d8aa-76e9-0a14-284ff5cbbc03' },
      birthday: { year: '507747b9-8472-bef3-5aae-0c54af175339' },
      data: { jack: 'surename' }
    }
    */
    console.log( this.paths);
    /*
    {
      name: [ 'name', '054b0c51-d8aa-76e9-0a14-284ff5cbbc03' ],
      year: [ 'year', '507747b9-8472-bef3-5aae-0c54af175339' ] }
    */

    console.log(':::this.revFields:::', this.revFields);
    this.revPaths = doRevPath(this.archetypeObj, this.revFields);
  }

  resolve(obj) {
    // solution 1: traveraw all the given obj. then remove the right one.
    // REMOVE?!

    // solution 2: extract all paths.
    // already implememed in this.revPaths
    //search();
    //return ...
    //return {'param1':'val1', 'param2': 'val2' };
    const outCome = {};
    for (const [unique_id, jsonpath] of Object.entries(this.revPaths)){
      console.log('jsonpath', jsonpath)
      const juice = getFromPath(jsonpath, obj, null);
      const key = this.revFields[unique_id];
      if(outCome[key] !== undefined) throw new Error('consistency error');
      //todo: can exist but being equal
      outCome[key] = juice;
    }
    return outCome;
    // works with happy path!
  }
  generate(keyValMap) {
    // an object sinmilar to this.archetypeObj. Instantiate: this.archetypeJson
    return {'obj': null};
  }
}

require('../templatore-store.js').register_templator(
  JsonSub, ['obj'], ['string'],
  // ['obj'], ['map']
  //todo: fix types
);


// todo: unit test
/*
{ '728e2019-1408-ef55-f51d-00d41ff9084e': [ 'profile', 'name' ],
  'c14703d5-c1f5-9492-cc23-e01faadf4647': [ 'birthday', 'year' ]
}
*/
function doRevPath(_obj, revFields)
{
  const revPaths = {};  //revMap
  function ppp(obj, pathsofar)
  {
    for (const [k, v] of Object.entries(obj))
    {
      console.log('checking:', k, v, 'revFields[v]=', revFields[v]);
      if (revFields[v] !== undefined) {
        const pathsofar2 = [...pathsofar, k];
        revPaths[v] = pathsofar2;
        console.log('found:', v, 'in--->', pathsofar2);
      }
      else if (typeof v === 'object') {
        const pathsofar2 = [...pathsofar, k];
        const obj2 = v;
        console.log('recursion:', pathsofar2);
        ppp(obj2, pathsofar2);
      }
    }
  }
  ppp(_obj, []);
  console.log('revPaths', revPaths);
  return revPaths;
}

function mapObjObj(obj, lambda) {
  const newObj = {};
  for (let [k, v] of Object.entries(obj)) {
    const [k2,v2] = lambda(k,v);
    //newObj[k] = [k2,v2];
    newObj[k2] = v2;
  }
  return newObj;
}

function uniqueID(){
  function chr4(){
    return Math.random().toString(16).slice(-4);
  }
  return chr4() + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() + chr4() + chr4();
}

//this should nerver appear in
const ERROR_SYMBOL = Symbol('error data');

function getFromPath(jsonpath, obj /*, fallback = `$\{${jsonpath}}`*/) {
  const fallback = ERROR_SYMBOL;
  // const jsonpath = path.split('.');
  return jsonpath.reduce((res, key) => res[key] || fallback, obj);
}

// by smeijer/parse-es6-template.js
function parseTemplate(template /*, map, fallback*/) {
  // todo: check format (syntax) before relying on regexp
  const fields = {};
  const enrichedJson = template.replace(/\$\{.+?\}/g, (match) => {
    const pathName = match.substr(2, match.length - 3).trim();
    console.log(match, pathName)
    //fields.push(pathName);
    //return getFromPath(pathName, map, fallback);
    //const s = new Symbole(pathName);
    const id = uniqueID();
    fields[pathName] = id;
    console.log(fields)
    return `"${id}"`;
  });
  console.log(template)
  console.log(enrichedJson)
  return {enrichedJson, fields};
}

//todo: use ES6 module format:  export default xyz;

module.exports = {
  JsonSub,
  templator: JsonSub,
};
