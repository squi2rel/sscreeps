const Building = require("Building");

const roleMisc = {
    name: "misc",
    /** @param {Creep} creep **/
    run: function(creep) {
        let flag = Game.flags["src"];
        if (flag) {
            creep.say(creep.memory.status);
            switch (creep.memory.status) {
                case "drop":
                    let target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: c => c.structureType == STRUCTURE_CONTAINER && c.store.getFreeCapacity() != 0 });
                    if (target != null && creep.transfer(target, RESOURCE_ENERGY, creep.store[RESOURCE_ENERGY]) == ERR_NOT_IN_RANGE) creep.moveTo(target);
                    if (target == null) creep.drop(RESOURCE_ENERGY, creep.store[RESOURCE_ENERGY]);
                    if (creep.store.getUsedCapacity() == 0) creep.memory.status = "goto";
                    break;
                case "back":
                    let flag2 = Game.flags["dst"];
                    if (flag2) creep.moveTo(flag2, {visualizePathStyle: {stroke: '#4d5ec1'}});
                    if (creep.pos.isEqualTo(flag2)) creep.memory.status = "drop";
                    break;
                case "take":
                    let en = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: c => c.resourceType == RESOURCE_ENERGY});
                    if (en != null && creep.pickup(en) == ERR_NOT_IN_RANGE) creep.moveTo(en);
                    if (en == null) {
                        en = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: c => c.store && c.store[RESOURCE_ENERGY] > 0});
                        if (en != null && Building.withdraw(creep, en, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) creep.moveTo(en);
                    }
                    if (en == null) flag.remove();
                    if (creep.store.getFreeCapacity() == 0) creep.memory.status = "back";
                    break;
                case "goto":
                    creep.moveTo(flag, {visualizePathStyle: {stroke: '#4d5ec1'}});
                    if (creep.pos.isEqualTo(flag)) creep.memory.status = "take";
                    break;
                default:
                    creep.memory.status = "goto";
            }
        } else {
            //creep.memory.suicide = true
        }
        
        if(creep.room.controller) {
            if(creep.signController(creep.room.controller, "awa") == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        
	}
};

module.exports = roleMisc