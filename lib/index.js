const parser = require('./parser')
const transform = require('./transformer')
const emitter = require('./emitter')

module.exports.parser = parser
module.exports.transform = transform
module.exports.compile = src => {
    const ast = parser.parse(src)

    return emitter(transform(ast))
}
module.exports.compileFile = async filename => {
    const ast = await parser.parseFile(filename)

    return emitter(transform(ast))
}
module.exports.emit = emitter
