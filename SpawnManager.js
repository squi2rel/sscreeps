const Finder = require("Finder");
const Events = require("Events");
const Flags = require("Flags");
const Pos = require("Pos");
const Matrixs = require("Matrixs");

function spawn(room, body, name, memory) {
    let spawns = Finder.find(room, STRUCTURE_SPAWN);
    for (let i = 0; i < spawns.length; i++) {
        let spawn = spawns[i];
        if (spawn.spawning) continue;
    }
}

function canSpawn(room, body) {
    
}

Events.on("RoomUpdate", room => {
    if (Game.time % 10 == 0) {
        let flag = Flags(room, "center");
        if (!flag) return;
        Pos.matrix(flag.pos.x, flag.pos.y, Matrixs.roads, (x, y) => {
            if (!flag.room.lookForAt(LOOK_STRUCTURES, x, y)[0] && !flag.room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y)[0]) flag.room.createConstructionSite(x, y, STRUCTURE_ROAD)
        });
        let total = EXTENSION_ENERGY_CAPACITY[flag.room.controller.level] * CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][flag.room.controller.level];
        if (flag.room.energyCapacityAvailable >= total + SPAWN_ENERGY_CAPACITY) return;
        let delta = (total + SPAWN_ENERGY_CAPACITY - flag.room.energyCapacityAvailable) / EXTENSION_ENERGY_CAPACITY[flag.room.controller.level];
        let added = 0;
        Pos.matrix(flag.pos.x, flag.pos.y, Matrixs.exts, (x, y) => {
            if (added == delta) return;
            if (!flag.room.lookForAt(LOOK_STRUCTURES, x, y)[0] && !flag.room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y)[0] && flag.room.createConstructionSite(x, y, STRUCTURE_EXTENSION) == OK) added++
        })
    }
});

module.exports = {
    spawn,
    canSpawn
}