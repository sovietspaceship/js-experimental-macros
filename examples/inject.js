/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */


module.exports = () => {
    macro => macro.define('operator', '*')

    macro => {
        return macro.literal(5)
    }


    macro => macro.define('debugMode', true)

    macro => macro.debugger(true)

    macro => {
        macro.define('debug', macro.debugMode ? () => {
            return macro.injectCall(macro.literal(() => {
                return (...v) => console.log('debug', ...v)
            }))
        } : () => {
            return () => {}
        })
    }

    const operator = macro => {
        const func = macro.operator === '+' ? macro.literal((a, b) => {
            return a + b
        }) : macro.literal((a, b) => {
            return a * b
        })

        return macro.inject(func)
    }

    macro => macro.inject(macro.literal(5))

    macro => {
        return (macro => macro.debug())('memes')
    }

    return operator(1, macro => 5)
}
