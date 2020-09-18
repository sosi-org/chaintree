
### A web API
See [./demo-templator-serve/readme.md]

Use it rto create langage constructs:
* Those that are water-tight.
* Uses Babel
* looks like a separate language

Possible directions: Decision points:
* Inline constructs in JS itself : (primitives)
   * define multiple:
      `var (a,b) <= (q,r)`
      when expanded, consumes `q`,`r`, defines two variables as vara in two lines.
   * `use @construct templatorc/constructs-primitives/safe-data-movers-chtr_style`
