'use strict';

// only data movement, import (require), etc.
// no code
// not definition of templates. (but you can use them by importaing them)

//seeds, tokens.
const seeds = require('./company-seed-info.json');

const {domain, product_name, channel, subcomp} = seeds;

const l_wellknown = ({domain, product_name, channel, subcomp}) => `https://${domain}/${product_name}/${channel}/${subcomp}/.well-known/openid-configuration`;

module.exports = {
    "wellknown": l_wellknown({domain, product_name, channel, subcomp}),
};
