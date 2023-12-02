const Finder = require("Finder");
const Pos = require("Pos");

const roleHarvester = {
    name: "harvester",
    /** @param {Creep} creep **/
    run: function(creep) {
	    if (creep.memory.dropping && creep.store[RESOURCE_ENERGY] == 0) creep.memory.dropping = false;
	    if (!creep.memory.dropping && creep.store.getFreeCapacity() == 0) creep.memory.dropping = true;
	    if (creep.memory.dropping) {
            let target = Finder.findStorage(creep, RESOURCE_ENERGY);
            let link = Finder.findNearestLink(creep);
            if (target && link && Pos.dst(target.pos, creep.pos) > Pos.dst(link.pos, creep.pos)) target = link;
            if (!target) target = Finder.findNearest(creep, STRUCTURE_CONTAINER);
            if (target && creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#80a982'}});
            }
	    } else {
	        Finder.findEnergy(creep, true, null, 1, true);
	    }
	}
};

module.exports = roleHarvester