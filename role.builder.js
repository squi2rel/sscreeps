const Finder = require("Finder");
const Building = require("Building");
const Settings = require("Settings");

const RU = require("role.upgrader");

const roleBuilder = {
    name: "builder",
    /** @param {Creep} creep **/
    run: function(creep) {
        creep.memory.dontPullMe = false;
	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }
	    if(creep.memory.building) {
	        if (creep.memory.outpost && Game.flags["outpost"]) {
	            let flag = Game.flags["outpost"];
	            if (creep.room != flag.room) {
	                creep.moveTo(flag);
	                return
	            }
	            let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
	            if (target && creep.build(target) == ERR_NOT_IN_RANGE) creep.moveTo(target);
	            if (!target) RU.run(creep);
	            return
	        }
	        let flag = Game.flags["build"];
	        let damaged = creep.memory.targetID ? Game.getObjectById(creep.memory.targetID) : Finder.findDamaged(creep, flag ? Settings.BuilderFixMinHealthPercentFlag : Settings.BuilderFixMinHealthPercent, creep.room.controller.level > 4 ? Settings.BuilderFixWallMinHealth : Settings.BuilderFixWallMinHealthFallback);
	        if (damaged) {
	            creep.memory.targetID = damaged.id;
	            if (creep.repair(damaged) == ERR_NOT_IN_RANGE) creep.moveTo(damaged);
	            if (damaged.hits >= (flag ? damaged.hitsMax * Settings.BuilderFixMaxHealthPercentFlag : damaged.hitsMax * Settings.BuilderFixMaxHealthPercent) || (damaged.structureType == STRUCTURE_WALL || damaged.structureType == STRUCTURE_RAMPART) && damaged.hits >= (creep.room.controller.level > 4 ? Settings.BuilderFixWallMaxHealth : Settings.BuilderFixWallMaxHealthFallback)) delete creep.memory.targetID;
	            return
	        }
	        delete creep.memory.targetID;
	        let target = flag;
	        if (target) target = Building.getBuilding(target.pos, LOOK_CONSTRUCTION_SITES);
	        if (!target) {
	            target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
	            if (flag) flag.remove()
	        }
	        if (!target) {
	            RU.run(creep);
	            return
	        }
            if (target && creep.build(target) == ERR_NOT_IN_RANGE) creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
	    } else {
	        if (Finder.findEnergy(creep, false, Settings.BuilderKeepEnergy)) creep.build(creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES))
	    }
	}
};

module.exports = roleBuilder