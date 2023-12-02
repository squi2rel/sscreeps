function min(a, s) {
    let m = Infinity, o = null;
    for (let i = 0; i < a.length; i++) {
        let c = a[i], e = s(c);
        if (m > e) {
            m = e;
            o = c
        }
    }
    return o
}

function max(a, s) {
    let m = -Infinity, o = null;
    for (let i = 0; i < a.length; i++) {
        let c = a[i], e = s(c);
        if (m < e) {
            m = e;
            o = c
        }
    }
    return o
}

module.exports = {
    min,
    max
}