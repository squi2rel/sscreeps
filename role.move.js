const Pos = require("Pos");
const Rooms = require("Rooms");
const Finder = require("Finder");

const roleMove = {
    name: "move",
    /** @param {Creep} creep **/
    run: function(creep) {
        let room = Rooms.getTask(creep.memory.room);
        if (!room) {
            creep.moveTo(Finder.find(Game.rooms[creep.memory.room], STRUCTURE_SPAWN)[0]);
            if (creep.room.name == creep.memory.room) creep.memory.suicide = true
            return
        }
        let pos = new RoomPosition(25, 25, room.roomName);
        creep.moveTo(pos, {visualizePathStyle: {stroke: '#ffffff'}})
	}
};

module.exports = roleMove