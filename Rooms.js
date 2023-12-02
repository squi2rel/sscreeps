const Events = require("Events");
const Arrays = require("Arrays");

const todoRooms = {};
const roomToTask = {};

const debug = true;

function getRoom(srcRoom, roomName, taskName, callback) {
    let room = Game.rooms[roomName];
    if (room) {
        callback(room);
        return true
    }
    let todos = todoRooms[roomName];
    if (!todos) todos = todoRooms[roomName] = {};
    if (!todos[taskName]) {
        let task = {
            srcRoom,
            roomName,
            taskName,
            callback
        };
        todos[taskName] = task;
        if (!roomToTask[srcRoom.name]) roomToTask[srcRoom.name] = [];
        roomToTask[srcRoom.name].push(task);
        if (debug) console.log("Scheduled inspect task for room " + roomName + " from " + srcRoom.name + " (" + taskName + ")")
    }
    return false
}

function updateRoom(room) {
    let todos = todoRooms[room.name];
    if (!todos) return;
    _.values(todos).forEach(c => {
        if (!c.finished) {
            c.callback(room);
            c.finished = true;
            if (debug) console.log("Finished inspect task for room " + c.roomName + " from " + c.srcRoom.name + " (" + c.taskName + ")")
        }
    })
}

function getTask(roomName) {
    let tasks = roomToTask[roomName];
    if (!tasks) return null;
    let task = tasks[tasks.length - 1];
    if (!task) return null;
    if (task.finished) {
        tasks.length--;
        return null
    }
    return task
}

function findNearest(roomName, firstRoom) {
    let s = Arrays.min(_.values(Game.rooms), r => Game.map.getRoomLinearDistance(r.name, roomName));
    return firstRoom && Game.map.getRoomLinearDistance(roomName, firstRoom.name) <= Game.map.getRoomLinearDistance(s.name, roomName) ? firstRoom : s
}

if (!Memory.map) Memory.map = {};

function findNear(srcRoomName) {
    _.values(Game.map.describeExits(srcRoomName)).forEach(roomName => {
        if (roomName.includes("0")) return;
        if (Memory.map[roomName]) return;
        getRoom(findNearest(roomName, Game.rooms[srcRoomName]), roomName, "inspect" + roomName, handleNewRoom)
    })
}

function handleNewRoom(room) {
    Memory.map[room.name] = {
        sources: room.find(FIND_SOURCES).length,
    };
    let m = (room.find(FIND_MINERALS)[0] || {}).mineralType
    if (m) Memory.map[room.name].mineral = m
}

Events.on("RoomUpdate", updateRoom);

module.exports = {
    getRoom,
    getTask,
    findNear,
    findNearest
}