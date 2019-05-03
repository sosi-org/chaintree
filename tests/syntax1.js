
//pattern
template /{
    name: *NAME,
    type: 'NUMBER',
    content: [
    {'wpc:value':[
        {_: *VAL, $: {'occurrence': *KEY}},
        **REPEAT
    ]}
]}/ tt;


const tt<*NAME=x, *REPEAT=y, [*VAL,*KEY, **REPEAT]=z> = {name:'ctr', type:'NUMBER'};
// x will be 'ctr'

How to enforce a type?
// crazy idea:     name: '*NAME', enforces the NAME to be a string.  // I reject this idea.


contraint
     NAME ->  'string'

template /{
    name: *NAME,
    type: 'NUMBER',
    ... (as *ETC)
]}/ qq;

tt & qq
//binds NAME

custom binding
 / tt<*NAME=NAME> & qq<*NAME=NAME2> / 
for example:
template / tt<*NAME=NAME> & qq<*NAME=NAME2> / rr;
template <*NAME:string> & qq;
// mixes a template with a type-binging-only template.
