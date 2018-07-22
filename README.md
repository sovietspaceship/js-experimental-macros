# (Experimental) JavaScript Macros

This library evaluates arbitrarily nested arrow functions with `macro` as only argument, rewriting the AST with the result of the call.

It also exposes an API to manipulate the AST during macro evaluation, and to handle pieces of syntax in the macro itself as values.

## Features

`macro => <js expression>`

Macro expressions are evaluated in a different environment from runtime code. No variable defined outside of the macro can be accessed;
state must be managed through the `macro` object API.

### Simple compile-time evaluation

As macro expressions are plain JavaScript functions, any computation can be performed in them. You can return any value except functions (which require `macro.literal`),
and it will be injected in the AST in place of the macro arrow function.

```js

const fibonacci = macro => {
    const v = [];

    v[0] = 0;
    v[1] = 1;

    for (let i = 2; i < 10; i++) {
        v[i] = v[i - 1] + v[i - 2];
    }

    return v
}

console.log(fibonacci)

```

generates

```js

const fibonacci = [
    0,
    1,
    1,
    2,
    3,
    5,
    8,
    13,
    21,
    34
];

console.log(fibonacci);

```

### Conditional evaluation

```js
module.exports = () => {
    macro => macro.define('operator', '+')

    const operator = macro => {
        const func = macro.operator === '+' ? macro.literal((a, b) => {
            return a + b
        }) : macro.literal((a, b) => {
            return a * b
        })

        return macro.inject(func)
    }

    return operator(1, 2)
}
```

generates

```
module.exports = () => {
    const operator = (a, b) => {
        return a + b
    }
    return operator(1, 2)
}
```

### General AST manipulation

The AST is exposed via `macro.ast` and `macro.node`, so it can be manipulated manually. It also exposes the [recast](https://github.com/benjamn/recast) API
via `macro.types`. See examples/convert-var.js for an example of AST manipulations, and [recast#usage](https://github.com/benjamn/recast#usage) for the recast types API.

## API

The entire API belongs to the `macro` arrow function argument. The returned value is merged into the AST (except functions, which must be returned using `macro.literal` and `macro.inject`);
Objects that represent AST nodes replace the current node instead of being inserted as object literals.

* `macro.literal(value: any) => ASTNode`: the main method of injecting syntactic fragments into the AST. The given argument is converted to its AST representation __before__ macro evaluation.

* `macro.inject(value: any) => ASTNode`: converts values to AST nodes at macro expansion time, after `macro.literal` has been expanded.

* `macro.injectCall(value: Function)`: injects a call with no arguments to the passed function. Used to inject a block of code.

* `macro.identity(value: T): T`: returns the value. Useless, but can prevent warnings about unused `macro` with eslint.

* `macro.define(name: string, value: any)`: define a variable in the macro-expansion environment, which can be accessed by name as property of `macro`.

* `macro.ast`: the entire AST.

* `macro.node`: current node (the macro arrow function).

* `macro.require`: exposes `require`, which is not available inside macros by default.

* `macro.expand(node: ASTNode)`: calls the macro expander, for whatever reason.

* `macro.types`: recast.types API

* `macro.parse(src: string)`: parse string containing JavaScript source code

### Returning values

```js
macro => 5
```

or

```js
macro => macro.inject(5)
```

or

```js
macro => macro.inject(macro.literal(5))
```

#### Returning functions

Functions cannot be returned by value, as they cannot be converted to literals by value. They must be explicitly converted
to literals and injected.

```js
macro => macro.inject(macro.literal(() => 5))
```

## Usage

Not meant for actual usage (production or not).

### CLI usage

`./bin/js-macros <input-file>`

returns the output via stdout.

### Library usage

* `exports.parse(src: string): ASTNode`: parse source code

* `exports.parseFile(filename: string): ASTNode`: parse file; appends .js if .js or .jsx are missing in `filename`

* `exports.transform(ASTNode): ASTNode`: expand macros

* `exports.emit(ast: ASTNode): string`: generate code from AST

* `exports.compile(src: string): string`: load, expand, emit source

* `exports.compileFile(filename: string): Promise<string>`: load, expand, emit source

## To do

* Improve API
* Replace `deepFind` with `esquery` or `esprima-selector`
* Refactor the whole thing
* Find a way to implicitly decompile runtime functions as values

## License

This software is released under the MIT license. See LICENSE for more informations.