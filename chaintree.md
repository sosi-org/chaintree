
# ChainTree's documentation
FlowChain

ChainTree (cht) is a set of tools for converting json-like objects to other forms of json-like objects.

ChainTree defines the conversion process by composition of functions in style of Functional Programming.
Each building blocks is called transformation (or transform, or operator), which is often comprised of other sub-transformations. The sub transforms can be `chain`ed or combined in other ways.

This overall transformation if often defined by a main part, and model config file.

### Transform
A Transform is a function object that has exactly one input argument, and one return value (i.e. returns a value that is not `undefined`). Examples:
* `(c)=>c`,
* `(c)=>c.key`.
* `(c)=>c[fn]`

The latter example has one explicit arugment (`c`) and one implicit argument (closure variable) (`fn`).
However, this is not a transformation:
* `(c,fn) => c[fn]`

### Pure transform
A pure transform has single input and single output, with no implicit arguments.
This defines the *purity property*.

### Compound transforms
k
### The `chain`
Transforms can be chained to each other, to make another Transform:
`f = chain(g, h)`

Note: logically (functionaly), `chain()` and `chain(f)` will be equivalent to functions `c=>c` and `f`.

Example: `chain()`, `chain(chain())`, `chain(chain(), chain(), chain())` are equivalent.

### Higher level operators
are the functions that receive (one or more) Transforms among their arguments.
Result of a higher-level operator is a Transform.

Example: `var f = process_array_chain_all(f,g,h)`

Exmapes include : Arrays operators, Focus operators, channel operators, etc.

The function `chain` is itself could be seens as a higher level operator. 

The higher order operators can have any number of arguments. Although they return pure functions (transforms with a single input and a single output), but themselves don't need to have that property. For exampkle `chain()` can receive any number of funcitons. Because the argument does not contain data, but code.

#### Array operators (Loop operators)

#### Accumulator (reducer) operators

#### Accumulator (reducer)

### Focused transformations

### field transformations

## Handling side information
Side information means information in the input data that is reuired for process but does not fit in a single input argument model of pure functions. Such side data can be provided in various ways. in closure, focused transfomrations, parent_ref, explicit (non-pure), ... .

#### Transformations with parent_ref
A technique used for transformaing without altering the purity property (transfomrations are single input and sinlge output).

## Topology of transfomrations
The structures dont change during the processing of input data.
However, during a stage of running, the circuits (flow chains) are being built (for example the second-order functions are called, functions are returned, etc). But the input data is not flowing in the structure of chained functions.
build-time (BT) and dataflow-time (DFT). They are analogous to compile-time and run-time in other languages.
If we see fch in light of omain Specific Languages (DSL), the BT and DFT correspond to compile-time and run-time of hte DSL language.



### V-shaped model of processing:
The processing of input data is comprised of two stages:
1. **Forward**: Works with data that are in source format (XML format).
2. **Backward**: Works with data that are essentiallly in target format (json format).
Each of these corresponse to a differnt part of the pipeline (chain of dataflow).
Note that in both pathways, the data content that is flowing is almost-json-like objects (Arrays, objects, strings, dictionaries, etc). But the format (data structures) are essentially different.

Forward can eb ambiguous sometimes, we can have intermediate formats. The Backward data is more clearly defined: The content that is baked as it will appear in the result.

A pivot point in one in which the first backward content is returned. (See example below).

Example:
data flowing in forward path
```javascript
{
    name: 'X/Length',
    type: 'NUMBER',
    content: [
    {'wpc:value':[
        {_: '1.0', $: {'occurrence':'0'}},
        {_: '3.1', $: {'occurrence':'1'}},
    ]}
    ]}
```
data flowing back in te backwards path:
```javascript
[1.0, 3.1]
```
which is converted using the following ChainTree process (written in ChainTree DSL):
```javascript
chain(
    c => c['content'],
    extract_array_of_size_1(''),
    c => extract_second_straight('wpc:value', c),
    pluck_from_numerated_array_parametrised(
        chain(),
        (idx) => (c => extract_field_and_constant(c, '_', {$: {'occurrence':''+idx}})),
    ),
    process_array(chain(
        parseFloat,  // pivot point
    )),
);
```
Note the pivot point.

If the data is seen as a large tree, in forward pathway, by following the control flow, we ofen digs deeper inside the tree of objects. In the backward pathway we return back to the surface. In the forward pathway we enter new functions recursively, while in the backward we return from recursive calls. Noet that The depth of recursion is fixed (See feed forward property section).

#### *
At each stage, the input argument (there is only one) is a json-able tree. The overall tree is divided into three parts: 1. The processed parts (finalised) 2. The unprocessed (or half processed) parts 3. parts above this, not visible.


#### no-recursion rule: (feed forward property)
The depth of recursion is fixed. No fuction call is truly recursive, i.e. if we enter a function wityt he same name, it is often a different instance of it. (technically: the closer of the upper function is not active, i.e. not called withon another call of that function object. The closure is not created more than once).
In other words, the tree structure in ChainTree trees is static (doe not change during the DFT time).
The arrangement of data returned in the functions backward is closer to the target format.

The structure of the ChainTree tree (after BT is completed) will ne be changed after BT. This structure will be tree-like, and also the structure of the input data (DFT) will be tree-like. But these trees should not be confused. Interestingly, their overall structure will be similar (because of no-recursion rule).

Note that the second-order function (in build time: BT) can be recursive (e.g. `process_layer4_grouping_new`) but it will create a ChainTree tree (i.e. static a tree of functions).

### Channels
Channles are a solution for defering the processing in a later stage.
The inner process ends the process and returns the contents wrapped in a channelwrapper object. This allows the process to be in two parts.
First part is done in one branch of processing, the rest is in a channel ...

### The data-safe property
The following operator is not a data-safe transform:
```javascript
c => c['content'],
c => c+1,
```
When applied to the following data, it causes data to be lost (in fields `name` and `type`):
```javascript
{ name: 'LEN', type: 'NUM', content: [1.0, 2.0, 3.0] }
```
A data-safe version of above process can use `focused_transform` and `blocked_content` :
```javascript
focused_transform('content', chain(
    x => x+1,
    ...
))
```
Thi preserves those other fields.
If we intentionally delete data, we can use `blocked_content`. It is safe because it is explicit.

#### The attribution property
Each function knows where in the data it is seeing.
Each function owns its own area of data. Correspondence bertween (parts of) data and functions.

#### The homology property
A data-safe process, the DSL script will be homologous to the data structure (See homology).
With certain criteria (data safe, purity)  of all sub transformation, a process DSL will have the homology property.
The structure of data will be visible in the code. The code will be more readable.

#### Internal repr trick:
Is about deviating from from the V model.


### Techniques
#### Wrapping in typed objects (channels)
#### parent_ref
#### internal repr
#### recursion in BT
#### deferring arguments
not recommended. Lazy arguments.

### Misc properties
#### three

## Notes:
[1] A json-like object is an object that can be obtained from a "JSON.parseString()", i.e. an object comprised of arrays, dictionaries, and a number of primitive types.
[2] An almost-json-like object is similarly comprised of arrays and dictionaries and primitives, but the primitives can be different (moment, blocvkedContent, IgnoredContent, ...). Also other wrappers can be used such as `keyval1`, or wrappers such as channelwrappers.

