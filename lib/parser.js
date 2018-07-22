// @flow

const recast = require('recast')
const espree = require('espree')
const fs = require('fs')

const parserOptions = {
    range: false,
    loc: false,
    comment: false,
    attachComment: false,
    tokens: false,
    ecmaVersion: 10,
    sourceType: 'module',
    ecmaFeatures: {
        jsx: true,
        globalReturn: false,
        impliedStrict: true
    }
}

function parser(src) {
    const comments = [];

    const ast = espree.parse(src, {
        loc: true,
        locations: true,
        comment: true,
        onComment: comments,
        ...parserOptions
    });

    if (!Array.isArray(ast.comments)) {
        ast.comments = comments;
    }

    return ast;
}

function parse(src) {
    return recast.parse(src, {
        parser: {
            parse: parser
        }
    })
}

function parseFile(filename) {
    if (!(/.jsx?$/).test(filename)) {
        filename += '.js'
    }

    return new Promise((resolve, reject) => {
        return fs.readFile(filename, 'utf8', (err, content) => {
            if (err) {
                return reject(err)
            }

            return resolve(parse(content.toString()))
        })
    })
}

function parseLiteral(literal) {
    return parse(JSON.stringify(literal, null, 4))
}

module.exports = {
    parse,
    parseFile,
    parseLiteral
}
