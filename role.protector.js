const Pos = require("Pos");
const Mathf = require("Mathf");

const repairMsgs = ["qwq"];

function attack(creep) {
    let en = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (en) {
        if (creep.attack(en) == ERR_NOT_IN_RANGE) creep.moveTo(en);
        return true
    }
    let flag = Game.flags["attack"];
    if (flag) {
        if (!creep.memory.arrived) {
            creep.moveTo(flag);
            if (creep.pos.isNearTo(flag)) creep.memory.arrived = true
            return true
        }
        let en = flag.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (!en) en = flag.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
        if (!en) {
            flag.remove();
            return false
        }
        if (creep.attack(en) == ERR_NOT_IN_RANGE) creep.moveTo(en);
        return true
    }
    return false
}

function heal(creep) {
    let en = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax });
    if (en) {
        if (creep.heal(en) == ERR_NOT_IN_RANGE) creep.moveTo(en);
        creep.say(repairMsgs[Mathf.rand(0, repairMsgs.length - 1)], true);
        return true
    }
    let my = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: c => Pos.dst(creep.pos, c.pos) < 5 && c.body.some(s => s.type == ATTACK || s.type == RANGED_ATTACK) });
    if (my) {
        creep.moveTo(my);
        return true
    }
}

const roleProtector = {
    name: "protector",
    /** @param {Creep} creep **/
    run: function(creep) {
        let res;
        if (creep.body.some(s => s.type == ATTACK || s.type == RANGED_ATTACK)) res = attack(creep);
        if (creep.body.some(s => s.type == HEAL)) res = heal(creep);
        if (!res) {
            let flag = Game.flags["target"];
            if (flag) {
                creep.moveTo(flag)
            }
        }
	}
};

module.exports = roleProtector