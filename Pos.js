const m1 = [-1, -1, -1, 0, -1, 1, 0, -1, 0, 1, 1, -1, 1, 0, 1, 1];
const m3 = [-2, -2, -2, -1, -2, 0, -2, 1, -2, 2, -1, -2, -1, 2, 0, -2, 0, 2, 1, -2, 1, 2, 2, -2, 2, -1, 2, 0, 2, 1, 2, 2];

function matrix(x, y, m, callback) {
    if (!callback) {
        callback = m;
        m = y;
        y = x.pos.y;
        x = x.pos.x;
    }
    for (let i = 0; i < m.length; i += 2) {
        let dx = m[i], dy = m[i + 1];
        callback(x + dx, y + dy, dx, dy)
    }
}

module.exports = {
    matrix,
    rect: (pos, callback) => {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                callback(pos.x + i, pos.y + j, i, j)
            }
        }
    },
    rect5: (pos, callback) => {
        for (let i = -3; i < 4; i++) {
            for (let j = -3; j < 4; j++) {
                callback(pos.x + i, pos.y + j, i, j)
            }
        }
    },
    outline1: (pos, callback) => matrix(pos.x, pos.y, m1, callback),
    outline3: (pos, callback) => matrix(pos.x, pos.y, m3, callback),
    /*
     2  3  4
    -1  0  1
    -4 -3 -2
    */
    delta: (p1, p2) => p1.x - p2.x + (p1.y - p2.y) * 3,
    /*
     6  7  8
     3  4  5
     0  1  2
    */
    deltaOffset: (p1, p2) => delta(p1, p2) + 4,
    pack: pos => [pos.x, pos.y, pos.roomName].join(","),
    unpack: packed => {
        let arr = packed.split(",");
        return new RoomPosition(arr[0], arr[1], arr[2])
    },
    dst: (p1, p2) => {
        let dx = p1.x - p2.x, dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy)
    },
    mdst: (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y),
    within3: (p1, p2) => Math.abs(p1.x - p2.x) < 3 && Math.abs(p1.y - p2.y) < 3,
    equals: (p1, p2) => p1.x == p2.x && p1.y == p2.y && p1.roomName == p2.roomName
}