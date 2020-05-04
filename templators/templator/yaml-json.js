'use strict';

const YAML = require('yamljs');

// NOT TESTED
class YamlJson2wayAdaptor {

  constructor(indent, indentJson) {
    this.conf = {
      yaml: {
        indent: indent,
        newline: true,
      },
      json: {
        indent: (indentJson === undefined) ? indent : indent,
        newline: true,
      },
    };
    if (this.conf.json.indent && !this.conf.json.newline) {
      // Bad Parameters
      throw new Error('Json format with indented but no newline is not supported');
    }
  }

  resolve(yamlString) {
      console.debug('YamlJson2wayAdaptor: yaml:', yamlString);
      const jso = nativeObject = YAML.parse(yamlString);
      const json = JSON.stringify(jso, undefined, this.conf.json.indent);
      return json;
  }
  generate(jsonString) {
      console.debug('YamlJson2wayAdaptor: json:', jsonString);
      const jso = JSON.parse(jsonString);;
      const yamlString = YAML.stringify(jso, 0, this.conf.yaml.indent);
      return yamlString;
  }
}

require('../templatore-store.js').register_templator(
    YamlJson2wayAdaptor, ['string'], ['string']
    // string: utf-8: json, string; utf-8; yaml,
    // idempotent projects
);


module.exports = {
  YamlJson2wayAdaptor,
  templator: YamlJson2wayAdaptor,
};
