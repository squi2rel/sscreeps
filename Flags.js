function flag(room, name) {
    let src = Game.flags[name];
    if (src && src.room) {
        src.room.createFlag(src.pos, src.name + "_" + src.room.name, src.color, src.secondaryColor);
        src.remove()
    }
    return Game.flags[name + "_" + room.name]
}

module.exports = flag