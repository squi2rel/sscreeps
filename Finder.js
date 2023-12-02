const Dispatcher = require("Dispatcher");
const Pos = require("Pos");
const Building = require("Building");
const Update = require("Update");
const Arrays = require("Arrays");
const Settings = require("Settings");

const updateTime = 10;

const builds = {};

const map = {};

function updateLink() {
    let arr = _.values(Game.rooms);
    for (let i = 0; i < arr.length; i++) {
        let room = arr[i];
        let links = find(room, STRUCTURE_LINK);
        if (!links) continue;
        let src = [];
        let dst = [];
        for (let j = 0; j < links.length; j++) {
            let link = links[j];
            if (!map[link.id]) map[link.id] = [Pos.within3(findNearest(link, STRUCTURE_SPAWN).pos, link.pos)];
            if (link.cooldown) continue;
            if (Building.usedPercent(link, RESOURCE_ENERGY) > 0.5) {
                src.push(link)
            } else {
                dst.push(link)
            }
        }
        let nowDst = dst.pop();
        for (let j = 0; j < src.length; j++) {
            let nowSrc = src[j];
            if (nowSrc.transferEnergy(nowDst, nowSrc.store[RESOURCE_ENERGY] - nowSrc.store.getCapacity(RESOURCE_ENERGY) * 0.5) == ERR_FULL) nowDst = dst.pop();
            if (!nowDst) break
        }
    }
}

function isHomeLink(link) {
    return (map[link.id] || [false])[0]
}

function update() {
    _.values(Game.rooms).forEach(updateRoom);
    updateLink()
}

function updateRoom(room) {
    builds[room] = {};
    let obj = builds[room];
    room.find(FIND_STRUCTURES).forEach(s => {
        let type = s.structureType;
        if (!obj[type]) obj[type] = [];
        obj[type].push(s)
    })
}

Update.add(update);

function find(room, type) {
    return builds[room] && builds[room][type] || []
}

function findNearest(creep, type, filter) {
    let room = creep.room, obj = builds[room];
    if (!obj || !obj[type]) return null;
    return Arrays.min(filter ? obj[type].filter(filter) : obj[type], s => Pos.dst(s.pos, creep.pos))
}

function findEnergy(creep, noStorage, min = 1, except, noLink, noRuin, noDropped, noWork) {
    let res;
    if ((res = findEnergy0(creep, noStorage, min, except, noLink, noRuin, noDropped, noWork)) && creep.memory._dp_src) Dispatcher.unclaimCreep(creep);
    return res
}

function findEnergy0(creep, noStorage, min, except, noLink, noRuin, noDropped, noWork) {//TODO split mine
    let source = creep.memory.work && !noWork ? creep.pos.findClosestByPath(FIND_SOURCES, {
        filter: s => Dispatcher.isFree(s, creep) && s.energy > 0
    }) : null;
    let sd = source ? Pos.dst(creep.pos, source.pos) : Infinity;
    let target;
    if (!noDropped) target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: c => c.resourceType == RESOURCE_ENERGY && c != except
    });
    if (!noDropped && target && Pos.dst(target.pos, creep.pos) - target.amount * Settings.FinderRuinEnergyDistanceCompensate < sd) {
        if (creep.pickup(target) == ERR_NOT_IN_RANGE) creep.moveTo(target, { visualizePathStyle: { stroke: "#80a982" } });
        return target
    }
    if (!noRuin) {
        target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: c => c.store[RESOURCE_ENERGY] && c != except
        });
        if (!target) target = creep.pos.findClosestByPath(FIND_RUINS, {
            filter: c => c.store[RESOURCE_ENERGY] && c != except
        });
    }
    let check = !target;
    if (!target && !noStorage) target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: c => c != except && c.store && (c.structureType == STRUCTURE_CONTAINER && c.store[RESOURCE_ENERGY] || (c.structureType == STRUCTURE_STORAGE || c.structureType == STRUCTURE_TERMINAL && (c.store[RESOURCE_ENERGY] || 0) > Settings.TerminalMaxEnergy) && (c.store[RESOURCE_ENERGY] || 0) - creep.store.getFreeCapacity(RESOURCE_ENERGY) >= min)
    });
    let link;
    if (!noLink) findNearest(creep, STRUCTURE_LINK, c => c != except && isHomeLink(c) && c.store[RESOURCE_ENERGY] > 400);
    if (!noLink && (!target || link && Pos.dst(creep.pos, target.pos) > Pos.dst(creep.pos, link.pos))) target = link;
    if (target && Pos.dst(target.pos, creep.pos) - target.store[RESOURCE_ENERGY] / 7 < sd) {
        if ((check && min && target.structureType != STRUCTURE_CONTAINER ? Building.withdrawKeep(creep, target, RESOURCE_ENERGY, min) : Building.withdraw(creep, target, RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE) creep.moveTo(target, { visualizePathStyle: { stroke: "#80a982" } });
        return target
    } else {
        if (!source) {
            creep.say("🛌");
            if (creep.memory._dp_src) Dispatcher.unclaimCreep(creep);
            return null
        }
        Dispatcher.claim(source, creep);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
        return null
    }
}

function findEnergyForCarrier(creep) {
    
}

function findNeeded(creep, noStorage, type, except) {
    if (!type) type = _.keys(creep.store)[0];
    let target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: s => s.store && s.structureType != STRUCTURE_CONTAINER && s.structureType != STRUCTURE_STORAGE && /*(s.structureType != STRUCTURE_LINK || (isHomeLink(s) && s.store[RESOURCE_ENERGY] == 0)) &&*/ (type == RESOURCE_ENERGY || s.structureType != STRUCTURE_LAB) && s.structureType != STRUCTURE_FACTORY && s.store.getFreeCapacity(type) > 0 && s != except
    });
    if (!target && creep.room.terminal && (creep.room.terminal.store[type] || 0) < Settings.TerminalMinResource) target = creep.room.terminal;
    if (!target && !noStorage) target = findStorage(creep, type, except);
    return target || null
}

function findNearestLink(creep) {
    return findNearest(creep, STRUCTURE_LINK, s => !isHomeLink(s) && s.store.getFreeCapacity(RESOURCE_ENERGY)) || null
}

function findStorage(creep, type, except) {
    return findNearest(creep, STRUCTURE_STORAGE, s => s != except && s.store.getFreeCapacity(type) > 0)
}

function findRuinWithResource(creep) {
    let target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: s => (s.store[RESOURCE_ENERGY] || 0) < s.store.getUsedCapacity()
    });
    if (!target) target = creep.pos.findClosestByPath(FIND_RUINS, {
        filter: s => (s.store[RESOURCE_ENERGY] || 0) < s.store.getUsedCapacity()
    });
    return target || null
}

function findDamaged(creep, mul = 1, wall = 5000) {
    let targets = creep.room.find(FIND_STRUCTURES, {
        filter: s => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) ? s.hits < wall : s.hits < s.hitsMax * mul
    });
    return targets[0] || null
}

function findResource(creep, type, me, amount = 1) {
    let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (!me || !s.my) && s.store && (type ? s.store[type] >= amount : s.store.getUsedCapacity())
    });
    return target || null
}

function findOre(creep) {
    return creep.room.find(FIND_MINERALS)[0] || null
}

function get(pos, type) {
    return pos.lookFor(type)[0] || null
}

module.exports = {
    isHomeLink,
    find,
    findNearest,
    findEnergy,
    findNeeded,
    findRuinWithResource,
    findDamaged,
    findNearestLink,
    findStorage,
    findResource,
    findOre,
    get
}