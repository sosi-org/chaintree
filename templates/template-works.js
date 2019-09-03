/* RegExp operations + RegExps marketplace. A simple RegExps language or myteampltes? Also for building a good RegExp for work */

function group(re) {
    // only if necessary
    return new RegExp('(' + re.source + ')');
}
function plus_able(...args) {
    return !"if concatable without parentheses";
}
/*
function concat(re1, re2) {
    return new RegExp('(' + re1.source + re2.source + ')');
}
*/
function concat(...re_arr) {
    console.log('concat:  ', re_arr);
    return group( new RegExp( re_arr.map(re => re.source).join('|') ));
}
function join(repeated, separator) {
    return concat( group( new RegExp(concat( repeated, separator ).source + '*')), repeated );
}
/** strip_extra_parantheses */
function simplify(re) {
    return re;
}

const domainname_with_dot = /((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}/;
const domainname = /((?!-)[A-Za-z0-9-\.]{1,69}(?<!-))/;
// Store these in a repo/marketplace
// const httphttps = /(http:\/\/)|(https:\/\/)/;
const httphttps = /http(s?):\/\//;
// http(s?):\/\/((?!-)[A-Za-z0-9-\.]{1,69}(?<!-))

const foldername = /([A-Za-z0-9-\.]+)/;
// const path = concat(group( foldername.source + /\//.source ));
// const path = concat(plus(foldername, + /\// )));
const path = join(foldername, /\// );


const testcases = [

"http://localhost:1080/test-api/keystore.openbankingtest.org.uk",
"https://ob-apie-mock-server.ll.eu-gb.bx.net/test-api/keystore.openbankingtest.org.uk",
"http://localhost:1080/test-api/tpp-info-ent-api/v1.0",
"https://ob-apie-mock-server.ll.eu-gb.bx.net/test-api/tpp-info-ent-api/v1.0",
/*
"localhost:1080/test-api/keystore.openbankingtest.org.uk",
"ob-apie-mock-server.ll.eu-gb.bx.net/test-api/keystore.openbankingtest.org.uk",
"localhost:1080/test-api/tpp-info-ent-api/v1.0",
"ob-apie-mock-server.ll.eu-gb.bx.net/test-api/tpp-info-ent-api/v1.0",
*/
];


testcases.forEach( url => {
  const full_url = concat(httphttps, domainname, path );
  console.log(full_url.source)

  console.log(

    full_url.exec(url)
  );
});
