
### A web API
See [./demo-templator-serve/readme.md]

### Inline constructs in JS itself : (primitives)
See "Inline primitives" below.

Use it to create langage constructs:
* Those that are water-tight.
* Uses Babel
* looks like a separate language

Example:


### Decision points
(Possible directions)

* "Inline primitives"
   * define multiple, or one variable only? (return-style): Answer: since we allow multiple inputs, why not allow multiple outputs?
      `var (a,b) <= (q,r)`
      when expanded, consumes `q`,`r`, defines two variables as vara in two lines.
   * `use @construct templatorc/constructs-primitives/safe-data-movers-chtr_style`

### Next step(s)
Next steps ready to be made.
* An array processor using generators
* http server API
* a demo webpage (online tool)
* json with interpolation
* async generastor for online processing
* is yaml-json already done?