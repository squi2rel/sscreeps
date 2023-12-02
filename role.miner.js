const Finder = require("Finder");
const Building = require("Building");
const Pos = require("Pos");

const roleHarvester = {
    name: "harvester",
    /** @param {Creep} creep **/
    run: function(creep) {
	    if (creep.memory.dropping && creep.store.getUsedCapacity() == 0) creep.memory.dropping = false;
	    if (!creep.memory.dropping && creep.store.getFreeCapacity() == 0 || creep.ticksToLive < 50) creep.memory.dropping = true;
	    if (creep.memory.dropping) {
            let target = Finder.findNeeded(creep, false, _.keys(creep.store)[0]);
            if (target && Building.transfer(creep, target) == ERR_NOT_IN_RANGE) creep.moveTo(target, {visualizePathStyle: {stroke: '#80a982'}})
	    } else {
	        let target = Finder.findOre(creep);
	        if (target && creep.harvest(target) == ERR_NOT_IN_RANGE) creep.moveTo(target, {visualizePathStyle: {stroke: '#80a982'}})
	    }
	}
};

module.exports = roleHarvester