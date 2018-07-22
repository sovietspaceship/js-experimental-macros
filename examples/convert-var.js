

/* eslint-disable no-unused-expressions */
/* eslint-disable no-var */

macro => {
    while (true) {
        const {
            findDeep
        } = macro.require('../lib/utils')

        const found = findDeep(macro.ast, node => {
            return node && !node.visited && node.type === 'VariableDeclaration' && node.kind === 'var'
        })

        if (!found) {
            break
        }

        found.visited = true

        found.kind = 'const'
    }
}

var x = 5
var y = 7
