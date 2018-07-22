/* eslint-disable no-unused-expressions */

const fibonacci = macro => {
    const v = [];

    v[0] = 0;
    v[1] = 1;

    for (let i = 2; i < 10; i++) {
        v[i] = v[i - 1] + v[i - 2];
    }

    return macro.identity(v)
}

console.log(fibonacci)

macro => {
    macro.define('fibonacci', n => {
        const v = [];

        v[0] = 0;
        v[1] = 1;

        for (let i = 2; i < n; i++) {
            v[i] = v[i - 1] + v[i - 1];
        }

        return macro.identity(v)
    })
}

const fibonacci15 = macro => macro.fibonacci(15)

console.log(fibonacci15)
