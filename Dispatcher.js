const Pos = require("Pos");
const Update = require("Update");
const Events = require("Events");

const debug = false;

var Points = {};
var lastTime = {};
var creeps = {};

function remove(id) {
    delete Points[id];
    delete lastTime[id]
}

function unclaimCreep(creep) {
    let src = creep.memory._dp_src;
    if (src) {
        free(src);
        eraserCreep(creep);
        if (debug) console.log(creep.name + " unclaimed(manual) " + src + ", remaining " + Points[src].remain);
    }
}

function eraserCreep(creep) {
    delete creep.memory._dp_src;
    delete creep.memory._dp_pos;
    delete creep.memory._dp_arrived
}

function isFree(r, creep) {
    if (creep.memory._dp_src) return creep.memory._dp_src == r.id ? true : false;
    if (!Points[r.id]) findFree(r);
    lastTime[r.id] = Game.time;
    return !!Points[r.id].remain
}

function claim(r, c) {
    if (c.memory._dp_src == r.id) return;
    Points[r.id].remain = Math.max(Points[r.id].remain - 1, 0);
    c.memory._dp_src = r.id;
    c.memory._dp_pos = Pos.pack(r.pos);
    if (debug) console.log(c.name + " claimed " + c.memory._dp_pos + ", remaining " + Points[r.id].remain)
}

function has(c) {
    return !!c.memory._dp_src
}

function findFree(r) {
    let t = r.room.getTerrain();
    let obj = Points[r.id] = { all: 0 };
    Pos.rect(r.pos, (x, y) => {
        if (t.get(x, y) != TERRAIN_MASK_WALL) obj.all++
    });
    obj.remain = obj.all
}

function free(r) {
    if (Points[r]) Points[r].remain = Math.min(Points[r].remain + 1, Points[r].all)
}

function creepUpdate(creep) {
    if (!creep.memory._dp_pos) return;
    if (!creep.memory._dp_arrived) {
        if (creep.pos.isNearTo(Pos.unpack(creep.memory._dp_pos))) creep.memory._dp_arrived = true;
        return
    }
    if (!creep.pos.isNearTo(Pos.unpack(creep.memory._dp_pos))) {
        free(creep.memory._dp_src);
        if (debug) console.log(creep.name + " unclaimed(auto) " + creep.memory._dp_pos + ", remaining " + Points[creep.memory._dp_src].remain);
        eraserCreep(creep)
    }
}

function clearCreep(m) {
    if (m._dp_src) {
        if (debug) console.log("unclaimed(dead) " + m._dp_pos + ", remaining " + (Points[m._dp_src].remain + 1));
        free(m._dp_src)
    }
}

function reset() {
    Points = {};
    lastTime = {};
    _.values(Game.creeps).forEach(c => eraserCreep(c))
}

Events.on("CreepUpdate", creepUpdate);
Events.on("ClearCreep", clearCreep);
reset();

module.exports = {
    reset,
    isFree,
    claim,
    has,
    clearCreep,
    free,
    unclaimCreep
}