const recast = require('recast')

module.exports = ast => {
    const recompiled = recast.print(ast).code

    return recompiled
}
