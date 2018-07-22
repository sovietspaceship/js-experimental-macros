// @flow

const parser = require('./parser')

describe('Parser', () => {
    it('should return an ast given valid code', () => {
        const result = parser.parse('let x = 5')

        expect(result.program.type).toBe('Program')
    })

    it('should return an ast given valid filename', async () => {
        const result = await parser.parseFile('examples/inject.js')

        expect(result.program.type).toBe('Program')
    })
})
