'use strict';

const YAML = require('yamljs');

const EXTREME_LARGE = 1000000000000000000;

// NOT TESTED
class YamlJson2wayAdaptor {

  constructor(indentBoth, indentJson_) {
    let indentYaml = 0;
    let indentJson = 0;
    let newline = 0;
    if (indentJson_ !== undefined) {
      indentYaml = indentBoth;
      indentJson = indentJson_;
      newline = true;
    } else if (indentBoth !== undefined) {
      indentYaml = indentBoth;
      indentJson = indentBoth;
      newline = true;
    } else {
      indentYaml = 0;
      indentJson = 0;
      newline = false;
    }

    // format & package it
    this.conf = {
      yaml: {
        indent: indentYaml,
        newline: newline,
      },
      json: {
        indent: indentJson,
        newline: newline,
      },
    };
    if (this.conf.json.indent && !this.conf.json.newline) {
      // Bad Parameters
      throw new Error('Json format with indented but no newline is not supported');
    }
  }

  resolve(yamlString) {
      //console.debug('YamlJson2wayAdaptor: yaml:', yamlString);
      const jso = YAML.parse(yamlString);
      const json = JSON.stringify(jso, undefined, this.conf.json.indent);
      //console.debug('this.conf', this.conf);
      //console.debug('converted to json:', json);
      return json;
  }
  generate(jsonString) {
      //console.debug('YamlJson2wayAdaptor: json:', jsonString);
      const jso = JSON.parse(jsonString);
      var yamlString;
      if (this.conf.yaml.newline) {
         yamlString = YAML.stringify(jso, EXTREME_LARGE, this.conf.yaml.indent);
      } else {
         yamlString = YAML.stringify(jso, 0);
         // https://github.com/jeremyfa/yaml.js/blob/develop/src/Dumper.coffee
      }
      //console.debug('converted to yaml:', yamlString);
      return yamlString;
  }
}

require('../templatore-store.js').register_templator(
    YamlJson2wayAdaptor, ['string'], ['string']
    // string: utf-8: json, string; utf-8; yaml,
    // idempotent projects
);
  // ['mime:application/json', 'mime:application/json;charset=utf-8'],
  // ['application/json', 'application/json;charset=utf-8'],


module.exports = {
  YamlJson2wayAdaptor,
  templator: YamlJson2wayAdaptor,
};
