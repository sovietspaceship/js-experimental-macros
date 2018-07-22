module.exports.findDeep = function findDeep(object, fn, found = {}) {
    if (typeof object !== 'object' || object == null ) {
        return
    }
    for (const i in object) {
        if (found.break) { break; }

        const el = object[i];

        if (!fn(el, i, object)) {
            findDeep(el, fn, found)
        }
        else {
            found.break = true
            found.value = el

            return found.value
        }
    }

    return found.value
}
