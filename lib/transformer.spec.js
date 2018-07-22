const parser = require('../lib/parser')
const transformer = require('../lib/transformer')
const emitter = require('../lib/emitter')

describe('transformer', () => {
    test('should replace macros with returned literal - 1', () => {
        const input = parser.parse(`
        macro => 5
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        5;
        `)
    })

    test('should replace macros with returned literal - 2', () => {
        const input = parser.parse(`
        macro => 'ok'
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        "ok";
        `)
    })

    test('should empty macro should return empty statement', () => {
        const input = parser.parse(`
        macro => {}
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        ;
        `)
    })

    test('macro.inject should inject literal into AST at macro - 1', () => {
        const input = parser.parse(`
        macro => macro.inject(5)
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        5;;
        `)
    })

    test('macro.inject should inject literal into AST at macro - 2', () => {
        const input = parser.parse(`
        macro => macro.inject(macro.literal(() => {}))
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        () => {};
        `)
    })

    test('macro.inject should inject literal into AST at macro - nested', () => {
        const input = parser.parse(`
        () => { macro => macro.inject(macro.literal(() => {})) }
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        () => {
                () => {};
        };
        `)
    })

    test('macro.injectCall should inject wrapped function literal into AST at macro - 1', () => {
        const input = parser.parse(`
        macro => macro.injectCall(macro.literal(() => {}))
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        (() => {})();
        `)
    })

    test('macro.injectCall should inject wrapped function literal into AST at macro - 2', () => {
        const input = parser.parse(`
        const funcResult = macro => macro.injectCall(macro.literal(() => {}))
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        const funcResult = (() => {})();
        `)
    })

    test('should evaluate at macro expansion time', () => {
        const input = parser.parse(`
        const funcResult = macro => 5 + 8
        `)

        const output = transformer(input)

        expect(emitter(output)).toBe(`
        const funcResult = 13;
        `)
    })
})
