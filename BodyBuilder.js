function build(total, ...bodies) {
    if (bodies.length == 1) bodies = bodies[0];
    let per = bodies.reduce((t, n) => t + BODYPART_COST[n[0]] * n[1], 0);
    let amount = Math.floor(total / per);
    let out = [];
    for (let i = 0; i < bodies.length; i++) {
        let [body, percent, limit] = bodies[i];
        let a = Math.min(amount * percent, limit || Infinity);
        for (let j = 0; j < a; j++) out.push(body)
    }
    return out
}

function repeat(...bodies) {
    let out = [];
    for (let i = 0; i < bodies.length; i++) {
        let [body, count] = bodies[i];
        for (let j = 0; j < count; j++) out.push(body)
    }
    return out
}

module.exports = {
    build,
    repeat
};