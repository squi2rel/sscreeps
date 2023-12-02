const Finder = require("Finder");
const Building = require("Building");
const Pos = require("Pos");
const Settings = require("Settings");
const Flags = require("Flags");

const targetObjs = {};

const roleCarrier = {
    name: "carrier",
    /** @param {Creep} creep **/
    run: function(creep) {
        creep.memory.dontPullMe = creep.memory.carrying;
        if (creep.store.getUsedCapacity() == 0) creep.memory.carrying = true;
        if (creep.store.getFreeCapacity() == 0) creep.memory.carrying = false;
	    if(creep.memory.carrying) {
	        let flag = Flags(creep.room, "carry");
	        if (flag) {
	            let flag2 = Flags(creep.room, "noenergy");
	            let target = Finder.get(flag.pos, LOOK_TOMBSTONES);
    	        if (target && !Building.hasItem(target)) {
    	            flag.remove();
    	            creep.memory.carrying = false;
    	            return
    	        }
    	        if (!target) target = Finder.get(flag.pos, LOOK_STRUCTURES);
    	        if (target && !(flag2 ? Building.hasItemExcept(target, RESOURCE_ENERGY) : Building.hasItem(target))) {
    	            flag.remove();
    	            creep.memory.carrying = false;
    	            return
    	        }
    	        if (target) creep.memory.source = target.id;
    	        if (target && (flag2 ? Building.withdrawExcept(creep, target, RESOURCE_ENERGY) : Building.withdraw(creep, target)) == ERR_NOT_IN_RANGE) creep.moveTo(target);
                if (creep.store.getFreeCapacity() == 0) creep.memory.carrying = false
	        } else {
	            let ruin = Finder.findRuinWithResource(creep);
	            if (ruin) {
	                if (Building.withdrawExcept(creep, ruin, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) creep.moveTo(ruin);
	                if (creep.store.getFreeCapacity() == 0 || !Building.hasItemExcept(ruin, RESOURCE_ENERGY)) creep.memory.carrying = false
	            } else {
    	            let tt = Flags(creep.room, "target");
    	            let b = null;
    	            if (tt) b = Finder.get(tt.pos, LOOK_STRUCTURES);
    	            let source = Finder.findEnergy(creep, false, 1, b);
    	            if (source) creep.memory.storage = source.structureType == STRUCTURE_CONTAINER || source.structureType == STRUCTURE_STORAGE;
    	            creep.memory.source = source && source.id || null;
	                if (!source || Pos.dst(creep.pos, source.pos) > 10) creep.memory.carrying = false
	            }
	        }
	    } else {
	        let t = _.keys(creep.store)[0];
	        let target = Finder.findNeeded(creep, true, t, Game.getObjectById(creep.memory.source));
	        if (!target && _.keys(creep.store)[0] == RESOURCE_ENERGY) {
    	        let flag = Flags(creep.room, "target");
    	        if (flag) {
    	            let b = Finder.get(flag.pos, LOOK_STRUCTURES);
    	            if (!b || !b.store) flag.remove();
    	            let res = _.keys(creep.store)[0];
    	            let percent = (b.store[res] || 0) / b.store.getCapacity(res);
    	            if (percent != 1 && percent != Infinity) {
        	            if (targetObjs[b.id]) {
        	                if (Building.transfer(creep, b) == ERR_NOT_IN_RANGE) creep.moveTo(b);
        	                if (percent > Settings.CarrierTargetFillMaxPercent) delete targetObjs[b.id];
        	            } else if (percent < Settings.CarrierTargetFillMinPercent) {
        	                targetObjs[b.id] = true;
        	                target = null
        	            }
    	            } else {
    	                target = null
    	            }
    	        }
	        }
	        if (!target && !creep.memory.storage) return;
	        if (!target) target = Finder.findStorage(creep, t);
	        if (target && Building.transfer(creep, target) == ERR_NOT_IN_RANGE) creep.moveTo(target)
	    }
	}
};

module.exports = roleCarrier