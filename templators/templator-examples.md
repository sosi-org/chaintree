Cases suitable for templator:

Plan the following

## Source-code representation:

BTW, a templator is a representation. Almost like a type.
* are specific to a language: JavaScript, Python, etc


#### StringTickJSRepresentation
String to tick in source
(Similar to JSON.strigify, but for back tick)
Is actually `escape()` encode



#### StringDoubleQuoteJSRepresentation
Converts to a form suitable for source code
* is specific to a language: JavaScript, Python, etc

#### StringToRegularExpressionSRepresentation
* '/file.js' -> `\/\/file\.js/`
* is a SourceCode representation (See "Attribute-based coordination" below)

## More ideas
### Coordination
Idea: Coordination
* Coord: string -> source/js/string/doublequote
* Coord: ....


#### Attribute-based coordination:
`.isSourceCode` // one side is a source code
`.langIs:JS`
`.from:string` // one side is a string
### Up
?

Navigating:
`templatorName2 = lang:javascrip(templatorName1)`
