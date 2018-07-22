
const parser = require('./parser')
const recast = require('recast');

const {
    findDeep
} = require('./utils')

module.exports = ast => {
    const emptyStatement = {
        'type': 'Program',
        'body': [
            {
                'type': 'EmptyStatement'
            }
        ]
    }

    const definitions = {}

    const state = {
        debugger: false
    }

    while (true) {
        if (!expandMacro(ast)) {
            break;
        }
    }

    return ast

    function expandMacro(ast) {
        const found = findDeep(ast, value => {
            return value &&
            !value.visited &&
            value.type === 'ArrowFunctionExpression' &&
            value.params &&
            value.params.length &&
            value.params[0].name === 'macro' &&
            value.body
        })

        if (!found) {
            return false
        }

        found.visited = true

        while (true) {
            if (!expandMacro(found)) {
                break
            }
        }

        found.visited = true

        while (true) {
            const foundLiteral = findDeep(found, node => {
                return node &&
                !node.visitedLiteral &&
                node.type === 'CallExpression' &&
                node.callee &&
                node.callee.object &&
                node.callee.object.type === 'Identifier' &&
                node.callee.object.name === 'macro' &&
                node.callee.property &&
                node.callee.property.type === 'Identifier' &&
                node.callee.property.name === 'literal' &&
                node.arguments &&
                node.arguments.length === 1 //&&
                //node.arguments[0].type === 'ArrowFunctionExpression'
            })

            if (!foundLiteral) {
                break
            }

            foundLiteral.visitedLiteral = true

            const literal = foundLiteral.arguments[0]

            const compiledLiteralMetadata = JSON.stringify(literal, null, 2)

            const decompiledLiteral = parser.parse(`;(${compiledLiteralMetadata})`)

            foundLiteral.arguments[0] = decompiledLiteral.program.body[1].expression
        }

        const body = found.body

        const bodyCode = recast.print(body).code

        const macroCode = `return macro => ${bodyCode}`

        if (state.debugger) {
            console.log('macroCode', macroCode)
        }

        const macroFunction = new Function(macroCode) // eslint-disable-line no-new-func

        const macroEnvironment = {
            ...definitions,
            ast,
            literal: value => {
                value.visitedLiteral = true

                return value
            },
            parse: parser.parse,
            define: (name, value) => {
                definitions[name] = value
            },
            debugger: b => {
                state.debugger = b
            },
            require,
            types: recast.types,
            expand: expandMacro,
            node: found,
            identity: x => x,
            inject: (literal) => {
                if (literal && !literal.visitedLiteral && literal.type !== 'Program' && !literal.program) {
                    return parser.parseLiteral(literal).program
                }

                return {
                    'type': 'Program',
                    'body': [
                        literal
                    ]
                }
            },
            injectCall: (functionLiteral) => {
                if (functionLiteral.type.includes('Function')) {
                    return {
                        'type': 'Program',
                        'body': [
                            {
                                'type': 'CallExpression',
                                'callee': functionLiteral,
                                'arguments': []
                            }
                        ]
                    }
                }

                return {
                    'type': 'Program',
                    'body': [
                        functionLiteral
                    ]
                }
            }

        }

        const macroResult = macroFunction()(macroEnvironment)

        found.visited = true

        if (typeof macroResult === 'object' && macroResult.type === 'Program') {
            const reparsedResult = macroResult.body[0]

            Object.assign(found, reparsedResult)
        } else if (macroResult) {
            const reparsedResult = parser.parseLiteral(macroResult)

            Object.assign(found, reparsedResult)
        } else {
            Object.assign(found, emptyStatement)
        }

        return true
    }

    // function hygienise(literal) {
    //     const variables = {}

    //     while (true) {
    //         const found = findDeep(literal, node => {
    //             return node &&
    //             !node.visitedIdentifier &&
    //             node.type === 'Identifier'
    //         })

    //         if (!found) {
    //             break
    //         }

    //         found.visitedIdentifier = true

    //         if (!variables[found.name]) {
    //             variables[found.name] = freshVariable(found.name)
    //         }
    //         found.name = variables[found.name]
    //     }

    //     function freshVariable(name) {
    //         return `_PREJS$_${name}${name.length}${name.split('').reduce((acc, i) => acc + i.charCodeAt(), 0)}`
    //     }

    //     return literal
    // module.exports = }
}
