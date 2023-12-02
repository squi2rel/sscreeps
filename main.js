"use strict";
const Update = require("Update");
const Events = require("Events");
const Finder = require("Finder");
const Mathf = require("Mathf");
const Settings = require("Settings");
const BodyBuilder = require("BodyBuilder");
const Rooms = require("Rooms");
const OutMine = require("OutMine");

require("ModuleEntry");

const RH = require('role.harvester');
const RU = require('role.upgrader');
const RB = require('role.builder');
const RP = require('role.protector');
const RM = require('role.misc');
const RR = require('role.reserver');
const RMo = require('role.move');
const RC = require('role.carrier');
const RMi = require('role.miner');
const RL = require('role.lab');
const RS = require('role.support');

const displayRole = false;
var anno = true;
const req = [
    {
        name: "reload",
        role: "harvester",
        modules: [WORK, WORK, CARRY, MOVE],
        amount: 1,
        enabled: (c, cs) => _.keys(cs).length == 0,
        run: c => Game.notify("寄")
    }, {
        name: "base",
        role: "carrier",
        modules: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        amount: 1,
        enabled: (c, cs) => _.keys(cs).length == 1
    }, {
        name: "harvesterPlus",
        role: "harvester",
        modules: [[WORK, 1, 6], [CARRY, 1, 6], [MOVE, 1, 6]],
        amount: 2
    }, {
        name: "carrier",
        role: "carrier",
        amount: c => c.room.energyCapacityAvailable > 1550 ? 2 : 1,
        modules: [[CARRY, 2, 12], [MOVE, 1, 6]]
    }, {
        name: "upgrader",
        role: "upgrader",
        modules: r => r.energyCapacityAvailable > 1550 ? BodyBuilder.repeat([WORK, 16], [CARRY, 4], [MOVE, 10]) : BodyBuilder.build(r.energyCapacityAvailable, [WORK, 3], [CARRY, 1], [MOVE, 2]),
        amount: c => c.room.energyCapacityAvailable > 1550 ? (c.room.terminal && c.room.terminal.store[RESOURCE_ENERGY] > 20000 || c.room.storage && c.room.storage.store[RESOURCE_ENERGY] > 20000) ? ((anno = true), 7) : ((anno && (Game.notify("能量用尽")), (anno = false)), 2) : 4
    }, {
        name: "move",
        role: "move",
        amount: 1,
        freeMove: true,
        modules: [MOVE],
        enabled: c => Rooms.getTask(c.room.name)
    }, {
        name: "outmine",
        role: "outmine",
        modules: [[WORK, 3, 9], [CARRY, 1, 3], [MOVE, 2, 6]],
        amount: c => OutMine.amount(c.room),
        enabled: c => OutMine.enabled(c.room)
    }, {
        name: "builder",
        role: "builder",
        amount: c => c.room.find(FIND_CONSTRUCTION_SITES)[0] ? 4 : 2,
        modules: [[WORK, 1, 5], [CARRY, 1, 5], [MOVE, 1, 5]]
    }, {
        name: "builderOutpost",
        role: "builder",
        amount: 3,
        modules: [[WORK, 1, 5], [CARRY, 1, 5], [MOVE, 2, 10]],
        enabled: () => Game.flags["outpost"] && c.room.energyCapacityAvailable > 1550,
        freeMove: true,
        memory: {
            outpost: true
        }
    }, {
        name: "miner",
        role: "miner",
        modules: [[WORK, 1, 6], [CARRY, 1, 6], [MOVE, 1, 6]],
        amount: 1,
        enabled: c => (c.room.find(FIND_MINERALS)[0] || {}).mineralAmount && Finder.find(c.room, STRUCTURE_EXTRACTOR)[0]
    }, {
        name: "clearer",
        role: "protector",
        modules: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
        freeMove: true,
        amount: 1,
        enabled: () => Game.flags["attack"]
    }, {
        name: "fighter",
        role: "protector",
        modules: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL],
        amount: 1,
        freeMove: true,
        enabled: c => !(c.room.find(FIND_HOSTILE_CREEPS)[0] || { name:"invader" }).name.includes("invader"),
        run: c => Game.notify("检测到入侵: " + _.map(c.room.find(FIND_HOSTILE_CREEPS), o => o.name + "(" + o.owner.username + ")"))
    }, /*{
        name: "labController",
        role: "lab",
        amount: 1,
        modules: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        enabled: () => false
    },*/ /*{
        name: "mender",
        role: "protector",
        modules: [TOUGH, HEAL, MOVE, MOVE],
        amount: 1,
        enabled: () => _.values(Game.creeps).some(s => s.hits < s.hitsMax)
    },*/ {
        name: "reserver",
        role: "reserver",
        modules: [MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM],
        amount: 1,
        freeMove: true,
        enabled: () => Game.flags["reserve"]
    }, {
        name: "support",
        role: "support",
        amount: 2,
        freeMove: true,
        enabled: c => Game.flags["support"] && Game.flags["support"].room != c.room,
        modules: [[WORK, 1, 10], [MOVE, 2, 20]]
    }, {
        name: "misc",
        role: "misc",
        amount: 2,
        freeMove: true,
        modules: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        enabled: c => Game.flags["src"]
    }, {
        name: "move",
        role: "move",
        amount: 1,
        freeMove: true,
        modules: [MOVE],
        enabled: c => Game.flags["move"]
    }
];

const reqMap = {};
for (let i of req) {
    reqMap[i.role] = i
}

function init() {
    console.log("Reboot!")
}

function main() {
    //let prev;
    //let prev2;
    Update.update();
    //prev = Game.cpu.getUsed();
    //console.log("update costs " + (Game.cpu.getUsed() - prev) + "ms");
    _.values(Game.rooms).forEach(room => {
        Events.fire("RoomUpdate", room);
        if (room.terminal && room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 100000 && Game.market.getOrderById("6565d2ef9d2911001289fd01").remainingAmount == 0) Game.market.extendOrder("6565d2ef9d2911001289fd01", 20000);
        //prev = Game.cpu.getUsed();
        let events = room.getEventLog();
        events.forEach(e => Events.fire(e.event, e));
        //console.log("fire events from " + room.name + " costs " + (Game.cpu.getUsed() - prev) + "ms");
        //prev = Game.cpu.getUsed();
        Finder.find(room, STRUCTURE_TOWER).forEach((tower, id) => {
            let target = null;
            if ((Game.time + id) % 2 == 0) {
                target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: s => s.body.some(b => b == HEAL)
                });
                if (!target) target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: s => s.body.every(b => b != HEAL)
                })
            } else {
                target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: s => s.body.every(b => b != HEAL)
                });
                if (!target) target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: s => s.body.some(b => b == HEAL)
                })
            }
            if (target) tower.attack(target);
            target = tower.pos.findClosestByRange(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax });
            if (target) tower.heal(target)
        })
    });
    //prev = Game.cpu.getUsed();
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            Events.fire("ClearCreep", Memory.creeps[name]);
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    //console.log("clear creeps costs " + (Game.cpu.getUsed() - prev) + "ms");
    _.values(Game.rooms).forEach(room => {
        let spawn = Finder.find(room, STRUCTURE_SPAWN)[0];
        if (!spawn) return;
        Events.fire("MyRoomUpdate", room);
        //prev = Game.cpu.getUsed();
        let roomCreeps = _.values(Game.creeps).filter(c => c.memory.room == room.name);
        let theCreep = roomCreeps.find(c => c.pos.roomName == room.name && !c.spawning);
        //console.log("get creeps from " + room.name + " costs " + (Game.cpu.getUsed() - prev) + "ms");
        //prev = Game.cpu.getUsed();
        if (!spawn.spawning) {
            let creeps = {};
            roomCreeps.forEach(c => creeps[c.memory.name] = (creeps[c.memory.name] || 0) + 1);
            for (let i = 0; i < req.length; i++) {
                let obj = req[i];
                let amount = isNaN(obj.amount) ? obj.amount(theCreep) : obj.amount;
                if (!obj.enabled || obj.enabled(theCreep, creeps)) {
                    if ((creeps[obj.name] || 0) < amount) {
                        obj.run && obj.run(theCreep);
                        let name = obj.name + Memory.lastID, modules = obj.modules instanceof Array ? obj.modules[0] instanceof Array ? BodyBuilder.build(room.energyCapacityAvailable, obj.modules) : obj.modules : obj.modules(room);
                        if (!spawn.spawnCreep(modules, name, { dryRun: true })) {
                            console.log("Spawning " + name + " with modules " + modules);
                            let mem = {
                                role: obj.role,
                                name: obj.name,
                                work: modules.some(s => s == WORK),
                                id: Mathf.id(),
                                room: room.name
                            };
                            if (obj.memory) Object.assign(mem, obj.memory);
                            spawn.spawnCreep(modules, name, {
                                memory: mem
                            })
                        }
                        break
                    }
                    if (creeps[obj.role]) creeps[obj.role] = Math.max(creeps[obj.role] - amount, 0)
                }
            }
        }
        //console.log("update spawns from " + room.name + " costs " + (Game.cpu.getUsed() - prev) + "ms");
        
        //prev = Game.cpu.getUsed();
        let builds = theCreep ? theCreep.room.find(FIND_CONSTRUCTION_SITES) : [];
    
        if (spawn.spawning) {
            let spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '' + spawningCreep.memory.name,
                spawn.pos.x + 1,
                spawn.pos.y,
                { align: 'left', opacity: 0.8 });
        }
    
        let tasks = { harvester: RH, upgrader: RU, builder: RB, misc: RM, protector: RP, reserver:RR, move: RMo, carrier: RC, miner: RMi, lab: RL, support: RS };
        if (Game.flags["outpost"] || builds.length || theCreep && Finder.findDamaged(theCreep, Game.flags["build"] ? Settings.BuilderFixMinHealthPercentFlag : Settings.BuilderFixMinHealthPercent, Settings.BuilderFixWallMinHealth)) {
            tasks.builder = RB
        } else {
            let target = theCreep ? Finder.findNeeded(theCreep, RESOURCE_ENERGY) : null;
            if (target) {
                tasks.builder = RC
            } else {
                tasks.builder = RU
            }
        }
        //console.log("calc tasks from " + room.name + " costs " + (Game.cpu.getUsed() - prev) + "ms");

        //prev = Game.cpu.getUsed();
        roomCreeps.forEach(creep => {
            if (creep.spawning) return;
            Events.fire("CreepUpdate", creep);
            let role = creep.memory.role;
            if (!role) return;
            if (displayRole) creep.say(role);
            let srcRoom = Game.rooms[creep.memory.room];
            if (tasks[role] == null) {
                let msg = creep.name + " bad role " + role;
                Game.notify(msg);
                console.log(msg);
                return
            }
            if (!reqMap[role].freeMove && creep.room != srcRoom) {
                creep.moveTo(Finder.find(srcRoom, STRUCTURE_SPAWN)[0]);
                return
            }
            try {
                //prev2 = Game.cpu.getUsed();
                tasks[role].run(creep)
                //console.log("update creeps from " + room.name + " role " + role + " id " + creep.memory.id + " costs " + (Game.cpu.getUsed() - prev2) + "ms")
            } catch (e) {
                let msg = "Error on role " + role + ": " + e.stack;
                Game.notify(msg);
                console.log(msg)
            }
        });
        //console.log("update creeps from " + room.name + " costs " + (Game.cpu.getUsed() - prev) + "ms");
    });

    if (Game.cpu.bucket >= 10000) Game.cpu.generatePixel() || console.log("Generated a pixel");
    //console.log("total time: " + Game.cpu.getUsed() + "ms");
    //console.log("---------------------------------------------------")
}

function loop() {
    try {
        main()
    } catch (e) {
        console.log(e.stack);
        Game.notify(e.stack)
    }
}

init();

module.exports.loop = loop