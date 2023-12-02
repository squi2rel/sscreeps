const Events = require("Events");
const Finder = require("Finder");

Events.on("CreepUpdate", creep => {
    let look = creep.pos.look();
    look.forEach(flag => {
        if (flag.type == LOOK_FLAGS && flag.flag.name == "kill") {
            delete creep.memory.role;
            creep.memory.suicide = true;
            flag.flag.remove()
        }
    });
    if (creep.memory.suicide) {
        let spawn = Finder.find(creep.room, STRUCTURE_SPAWN)[0];
        if (!spawn) return;
        creep.memory.role = null;
        creep.say("suiciding " + creep.name);
        if (spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ff0000'}})
    }
})