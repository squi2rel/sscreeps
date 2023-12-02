const Finder = require("Finder");
const Settings = require("Settings");

var roleUpgrader = {
    name: "upgrader",
    /** @param {Creep} creep **/
    run: function(creep) {
        creep.memory.dontPullMe = true;
	    if(creep.memory.mining && creep.store.getFreeCapacity() == 0) creep.memory.mining = false;
	    if(!creep.memory.mining && creep.store[RESOURCE_ENERGY] == 0) creep.memory.mining = true;
	    if(creep.memory.mining) {
	        Finder.findEnergy(creep, false, Settings.UpgraderKeepEnergy, null, false, true, true, false)
        } else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#80a982'} });
            }
        }
	}
};

module.exports = roleUpgrader