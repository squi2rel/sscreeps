if (!Memory.lastID) Memory.lastID = 0;

function rand(min, max) {
    return Math.floor(Math.random() * ( max - min + 1)) + min
}

function id() {
    return Memory.lastID++
}

module.exports = {
    rand,
    id
}