'use strict';

// only data movement, import (require), etc.
// no code
// not definition of templates. (but you can use them by importaing them)

//seeds, tokens.
const seeds = require('./sensitive-data/SIT01-OBIE/company-seed-info.json');

const {domain, product_name, channel, subcomp, app_id_secret, services} = seeds;

const l_wellknown = ({domain, product_name, channel, subcomp}) => `https://${domain}/${product_name}/${channel}/${subcomp}/.well-known/openid-configuration`;

const l_aisp_aaconsents = ({domain, product_name, channel, subcomp, obver}) =>
    `https://${domain}/${product_name}/${channel}/${subcomp}/open-banking/${obver}/aisp/account-access-consents`;

//l_* means lazy

function l_account_access_consents({obver}) {
    return l_aisp_aaconsents({
        domain: services.aisp.domain,
        product_name: services.aisp.product_name,
        channel: services.aisp.channel,
        subcomp: services.aisp.subcomp,
        obver
    });
}

module.exports = {
    "wellknown": l_wellknown({domain, product_name, channel, subcomp}),
    // ClientId, ClientSewcret, created by "App-creation".
    app_id_secret,
    "account-access-consents": l_account_access_consents,
};
